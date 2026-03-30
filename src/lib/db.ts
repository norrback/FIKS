import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { findProjectRoot } from "@/lib/projectRoot";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

/** After `prisma generate`, Next.js dev/HMR can keep an old singleton without new models. */
function isPrismaClientInSync(client: PrismaClient): boolean {
  const c = client as unknown as {
    repairerCompletedJob?: { findMany: unknown };
    repairStory?: { findMany: unknown };
  };
  return (
    typeof c.repairerCompletedJob?.findMany === "function" &&
    typeof c.repairStory?.findMany === "function"
  );
}

/**
 * Resolve SQLite `file:` URLs against the repo root (same DB as `npx prisma db push`),
 * not `process.cwd()` — Next.js can run route handlers with a different cwd.
 */
function sqliteUrlForAdapter(): string {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (!raw.startsWith("file:")) return raw;
  const rel = raw.slice("file:".length).replace(/^\//, "");
  if (path.isAbsolute(rel)) {
    return `file:${rel.replace(/\\/g, "/")}`;
  }
  const root = findProjectRoot();
  const abs = path.join(root, rel);
  return `file:${abs.replace(/\\/g, "/")}`;
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: sqliteUrlForAdapter() });
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma && !isPrismaClientInSync(globalForPrisma.prisma)) {
    globalForPrisma.prisma = undefined;
  }

  const client = globalForPrisma.prisma ?? createPrismaClient();
  if (!isPrismaClientInSync(client)) {
    throw new Error(
      "Prisma client is out of date vs schema. Run `npx prisma generate`, then restart the dev server.",
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrisma();
