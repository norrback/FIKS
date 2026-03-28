import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(root, ".env") });

function sqliteUrlForAdapter(): string {
  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (!raw.startsWith("file:")) return raw;
  const rel = raw.slice("file:".length).replace(/^\//, "");
  if (path.isAbsolute(rel)) {
    return `file:${rel.replace(/\\/g, "/")}`;
  }
  const abs = path.join(root, rel);
  return `file:${abs.replace(/\\/g, "/")}`;
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: sqliteUrlForAdapter() }),
});

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      passwordHash,
      name: "Test Setup User",
      role: "USER",
    },
  });

  console.log(`Upserted test user: ${user.email} with password: password123`);

  const repairerEmail = "repairer@example.com";
  const repairerUser = await prisma.user.upsert({
    where: { email: repairerEmail },
    update: { name: "Demo Repairer" },
    create: {
      email: repairerEmail,
      passwordHash,
      name: "Demo Repairer",
      role: "REPAIRER",
    },
  });

  await prisma.repairerProfile.upsert({
    where: { userId: repairerUser.id },
    update: {
      bio: "Certified electronics tech. 10+ years fixing boards, power supplies, and small appliances.",
      serviceDescription:
        "Drop-off or on-site diagnostics in Helsinki area. Typical turnaround 3–5 business days after parts arrive.",
      expertise: JSON.stringify(["Electronics", "Small appliances", "Soldering"]),
      completedJobsCount: 14,
      ratingSum: 62,
      ratingCount: 14,
    },
    create: {
      userId: repairerUser.id,
      slug: "demo-repairer",
      bio: "Certified electronics tech. 10+ years fixing boards, power supplies, and small appliances.",
      serviceDescription:
        "Drop-off or on-site diagnostics in Helsinki area. Typical turnaround 3–5 business days after parts arrive.",
      expertise: JSON.stringify(["Electronics", "Small appliances", "Soldering"]),
      completedJobsCount: 14,
      ratingSum: 62,
      ratingCount: 14,
    },
  });

  console.log(`Upserted repairer: ${repairerEmail} / password123 — /repairers/demo-repairer`);

  const featuredTextileEmail = "featured-textile@example.com";
  const featuredTextileUser = await prisma.user.upsert({
    where: { email: featuredTextileEmail },
    update: { name: "NordSöm Atelje" },
    create: {
      email: featuredTextileEmail,
      passwordHash,
      name: "NordSöm Atelje",
      role: "REPAIRER",
    },
  });

  await prisma.repairerProfile.upsert({
    where: { userId: featuredTextileUser.id },
    update: {
      bio: "Tailor and textile repair specialist serving Ostrobothnia.",
      serviceDescription:
        "Alterations, zippers, and outerwear — studio work with quick turnaround.",
      expertise: JSON.stringify(["Textiles", "Clothing"]),
      completedJobsCount: 11,
      ratingSum: 38,
      ratingCount: 8,
    },
    create: {
      userId: featuredTextileUser.id,
      slug: "nord-som-atelje",
      bio: "Tailor and textile repair specialist serving Ostrobothnia.",
      serviceDescription:
        "Alterations, zippers, and outerwear — studio work with quick turnaround.",
      expertise: JSON.stringify(["Textiles", "Clothing"]),
      completedJobsCount: 11,
      ratingSum: 38,
      ratingCount: 8,
    },
  });

  console.log(`Upserted featured repairer: ${featuredTextileEmail} / password123 — /repairers/nord-som-atelje`);

  const featuredBikeEmail = "featured-bike@example.com";
  const featuredBikeUser = await prisma.user.upsert({
    where: { email: featuredBikeEmail },
    update: { name: "Lumo Pyöräpaja" },
    create: {
      email: featuredBikeEmail,
      passwordHash,
      name: "Lumo Pyöräpaja",
      role: "REPAIRER",
    },
  });

  await prisma.repairerProfile.upsert({
    where: { userId: featuredBikeUser.id },
    update: {
      bio: "Neighborhood bike shop focused on commuter and touring bikes.",
      serviceDescription:
        "Tune-ups, wheel truing, and drivetrain repairs for daily riders.",
      expertise: JSON.stringify(["Bicycles", "Wheel building"]),
      completedJobsCount: 31,
      ratingSum: 105,
      ratingCount: 22,
    },
    create: {
      userId: featuredBikeUser.id,
      slug: "lumo-pyorapaja",
      bio: "Neighborhood bike shop focused on commuter and touring bikes.",
      serviceDescription:
        "Tune-ups, wheel truing, and drivetrain repairs for daily riders.",
      expertise: JSON.stringify(["Bicycles", "Wheel building"]),
      completedJobsCount: 31,
      ratingSum: 105,
      ratingCount: 22,
    },
  });

  console.log(`Upserted featured repairer: ${featuredBikeEmail} / password123 — /repairers/lumo-pyorapaja`);

  const listings = [
    {
      title: "Broken Floor Fan",
      description:
        "The fan turns on but the blades do not spin. Motor makes a humming sound.",
      location: "Helsinki",
      status: "OPEN",
      authorId: user.id,
    },
    {
      title: "Broken Winter Jacket Zipper",
      description:
        "The main zipper on my winter coat is detached at the bottom. Needs replacement.",
      location: "Espoo",
      status: "OPEN",
      authorId: user.id,
    },
    {
      title: "Broken Garden LED Light",
      description:
        "Solar garden light stopped working. Battery seems fine, probably a wire issue.",
      location: "Vantaa",
      status: "OPEN",
      authorId: user.id,
    },
  ];

  for (const item of listings) {
    const listing = await prisma.listing.create({ data: item });
    console.log(`Created listing: ${listing.title}`);
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
