import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

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

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const adapter = new PrismaPg(connectionString);
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

/**
 * Lazy Prisma client — created on first property access, not at import time.
 * This prevents build failures when DATABASE_URL is unavailable during
 * static page generation (e.g. /_not-found on Vercel).
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    return Reflect.get(client, prop, client);
  },
});
