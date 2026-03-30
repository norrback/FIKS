import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { findProjectRoot } from "@/lib/projectRoot";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

/** After `prisma generate`, Next.js dev/HMR can keep an old singleton without new models. */
function hasRepairerCompletedJobDelegate(client: PrismaClient): boolean {
  return typeof (client as unknown as { repairerCompletedJob?: { findMany: unknown } }).repairerCompletedJob
    ?.findMany === "function";
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
  if (
    process.env.NODE_ENV !== "production" &&
    globalForPrisma.prisma &&
    !hasRepairerCompletedJobDelegate(globalForPrisma.prisma)
  ) {
    globalForPrisma.prisma = undefined;
  }

  const client = globalForPrisma.prisma ?? createPrismaClient();
  if (!hasRepairerCompletedJobDelegate(client)) {
    throw new Error(
      "Prisma client is missing RepairerCompletedJob (schema newer than client). Run `npx prisma generate`, then restart the dev server.",
    );
  }

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrisma();
