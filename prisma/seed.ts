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

type JobSeed = {
  title: string;
  itemSummary: string;
  completedAt: Date;
  ratingStars: number | null;
  agreementSummary: string;
  messagesSummary: string;
  repairStoryNotes?: string;
};

function jobRatings(jobs: JobSeed[]) {
  const rated = jobs.filter((j) => j.ratingStars != null) as (JobSeed & { ratingStars: number })[];
  const ratingSum = rated.reduce((a, j) => a + j.ratingStars, 0);
  const ratingCount = rated.length;
  return { ratingSum, ratingCount };
}

async function replaceCompletedJobs(profileId: string, jobs: JobSeed[]) {
  await prisma.repairerCompletedJob.deleteMany({ where: { repairerProfileId: profileId } });
  if (jobs.length === 0) return;
  await prisma.repairerCompletedJob.createMany({
    data: jobs.map((j) => ({
      repairerProfileId: profileId,
      title: j.title,
      itemSummary: j.itemSummary,
      completedAt: j.completedAt,
      ratingStars: j.ratingStars,
      agreementSummary: j.agreementSummary,
      messagesSummary: j.messagesSummary,
      repairStoryNotes: j.repairStoryNotes ?? "",
    })),
  });
}

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

  const demoJobs: JobSeed[] = [
    {
      title: "Vintage stereo receiver",
      itemSummary: "Power section recap, noisy volume pot cleaned, speaker relay serviced.",
      completedAt: new Date("2025-01-12T12:00:00Z"),
      ratingStars: 5,
      agreementSummary:
        "Written scope: bench diagnostic (included), parts at supplier cost + 10% handling, labour capped at estimate unless customer approves change order.",
      messagesSummary:
        "Customer sent board photos before drop-off. We confirmed fuse type and agreed on a pickup window after SMS when the unit was ready.",
    },
    {
      title: "Home espresso machine",
      itemSummary: "Descale, group gasket, and steam wand leak — full service package.",
      completedAt: new Date("2024-11-28T10:00:00Z"),
      ratingStars: 5,
      agreementSummary:
        "Flat service fee for labour and standard seals; exotic parts quoted before order. Warranty 90 days on installed seals.",
      messagesSummary:
        "Thread covered machine model/serial, water hardness, and shipping vs drop-off. Customer approved the quote within the FIKS thread.",
    },
    {
      title: "Wireless game controller",
      itemSummary: "Analog stick module replacement and calibration.",
      completedAt: new Date("2024-10-05T15:30:00Z"),
      ratingStars: 4,
      agreementSummary:
        "Flat out-of-warranty repair fee; if the main board was damaged, we would pause for approval before continuing.",
      messagesSummary:
        "Quick back-and-forth on colour/firmware revision. Customer dropped off labelled with FIKS job code on the bag.",
    },
  ];
  const demoRatings = jobRatings(demoJobs);

  const demoProfile = await prisma.repairerProfile.upsert({
    where: { userId: repairerUser.id },
    update: {
      bio: "Certified electronics tech. 10+ years fixing boards, power supplies, and small appliances.",
      serviceDescription:
        "Drop-off or on-site diagnostics in Helsinki area. Typical turnaround 3–5 business days after parts arrive.",
      expertise: JSON.stringify(["Electronics", "Small appliances", "Soldering"]),
      completedJobsCount: demoJobs.length,
      ratingSum: demoRatings.ratingSum,
      ratingCount: demoRatings.ratingCount,
      servicePhotoUrl:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
      serviceLocationLabel: "Helsinki — Kruununhaka workshop",
      serviceLatitude: 60.1717,
      serviceLongitude: 24.951,
    },
    create: {
      userId: repairerUser.id,
      slug: "demo-repairer",
      bio: "Certified electronics tech. 10+ years fixing boards, power supplies, and small appliances.",
      serviceDescription:
        "Drop-off or on-site diagnostics in Helsinki area. Typical turnaround 3–5 business days after parts arrive.",
      expertise: JSON.stringify(["Electronics", "Small appliances", "Soldering"]),
      completedJobsCount: demoJobs.length,
      ratingSum: demoRatings.ratingSum,
      ratingCount: demoRatings.ratingCount,
      servicePhotoUrl:
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
      serviceLocationLabel: "Helsinki — Kruununhaka workshop",
      serviceLatitude: 60.1717,
      serviceLongitude: 24.951,
    },
  });
  await replaceCompletedJobs(demoProfile.id, demoJobs);

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

  const textileJobs: JobSeed[] = [
    {
      title: "Winter parka zipper",
      itemSummary: "Two-way zipper replaced; tape matched to original colour family.",
      completedAt: new Date("2025-02-01T11:00:00Z"),
      ratingStars: 5,
      agreementSummary:
        "Studio intake form signed digitally in FIKS: zipper grade (YKK vs budget), timeline 5 business days, alterations priced before work starts.",
      messagesSummary:
        "Customer uploaded zipper photos and lining colour. We confirmed whether to preserve the original pull tab.",
    },
    {
      title: "Wool suit trousers",
      itemSummary: "Hem and minor waist adjustment for wedding fit.",
      completedAt: new Date("2024-12-18T09:00:00Z"),
      ratingStars: 5,
      agreementSummary:
        "Fitting appointment 30 min, second fitting if needed included in quoted price; pressing before pickup.",
      messagesSummary:
        "Scheduled fitting via FIKS messages; customer brought shoes they will wear at the event for accurate break at the hem.",
    },
  ];
  const textileRatings = jobRatings(textileJobs);

  const textileProfile = await prisma.repairerProfile.upsert({
    where: { userId: featuredTextileUser.id },
    update: {
      bio: "Tailor and textile repair specialist serving Ostrobothnia.",
      serviceDescription:
        "Alterations, zippers, and outerwear — studio work with quick turnaround.",
      expertise: JSON.stringify(["Textiles", "Clothing"]),
      completedJobsCount: textileJobs.length,
      ratingSum: textileRatings.ratingSum,
      ratingCount: textileRatings.ratingCount,
      servicePhotoUrl:
        "https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&w=800&q=80",
      serviceLocationLabel: "Vaasa — studio by the market hall",
      serviceLatitude: 63.096,
      serviceLongitude: 21.6158,
    },
    create: {
      userId: featuredTextileUser.id,
      slug: "nord-som-atelje",
      bio: "Tailor and textile repair specialist serving Ostrobothnia.",
      serviceDescription:
        "Alterations, zippers, and outerwear — studio work with quick turnaround.",
      expertise: JSON.stringify(["Textiles", "Clothing"]),
      completedJobsCount: textileJobs.length,
      ratingSum: textileRatings.ratingSum,
      ratingCount: textileRatings.ratingCount,
      servicePhotoUrl:
        "https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&w=800&q=80",
      serviceLocationLabel: "Vaasa — studio by the market hall",
      serviceLatitude: 63.096,
      serviceLongitude: 21.6158,
    },
  });
  await replaceCompletedJobs(textileProfile.id, textileJobs);

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

  const bikeJobs: JobSeed[] = [
    {
      title: "Commuter annual service",
      itemSummary: "Full tune: cables, brakes, bearings check, chain wear measured.",
      completedAt: new Date("2025-02-20T08:00:00Z"),
      ratingStars: 5,
      agreementSummary:
        "Service menu tier B; replace chain only if stretch > 0.75%; pads and rotors quoted if below safe minimum.",
      messagesSummary:
        "Customer listed daily km and last service date. We confirmed whether to include dynamo hub connector check.",
    },
    {
      title: "Rear wheel true",
      itemSummary: "Lateral and radial true, stress relief, spoke tension balanced.",
      completedAt: new Date("2025-01-08T13:00:00Z"),
      ratingStars: 5,
      agreementSummary:
        "Wheel-only work: if rim or nipples fail during service, we stop and send photos before ordering parts.",
      messagesSummary:
        "Photos of hop in the stand shared in FIKS; agreed on pickup same day if ready before 17:00.",
    },
    {
      title: "Drivetrain refresh",
      itemSummary: "New cassette, chain, and jockey wheels; hanger alignment checked.",
      completedAt: new Date("2024-11-22T10:00:00Z"),
      ratingStars: 4,
      agreementSummary:
        "Parts list locked after bike intake; labour includes index and limit screw setup on stand + short test ride.",
      messagesSummary:
        "Discussed 1× vs 2× compatibility and whether to reuse the existing chainring.",
    },
    {
      title: "Hydraulic brake bleed",
      itemSummary: "Front and rear bleed, pad inspection, lever feel matched.",
      completedAt: new Date("2024-10-14T14:00:00Z"),
      ratingStars: 5,
      agreementSummary:
        "Manufacturer fluid spec only; if caliper piston sticky, additional labour quoted before rebuild.",
      messagesSummary:
        "Confirmed brake model and whether levers are mineral oil or DOT. Drop-off locker code shared via FIKS.",
    },
  ];
  const bikeRatings = jobRatings(bikeJobs);

  const bikeProfile = await prisma.repairerProfile.upsert({
    where: { userId: featuredBikeUser.id },
    update: {
      bio: "Neighborhood bike shop focused on commuter and touring bikes.",
      serviceDescription:
        "Tune-ups, wheel truing, and drivetrain repairs for daily riders.",
      expertise: JSON.stringify(["Bicycles", "Wheel building"]),
      completedJobsCount: bikeJobs.length,
      ratingSum: bikeRatings.ratingSum,
      ratingCount: bikeRatings.ratingCount,
      servicePhotoUrl:
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
      serviceLocationLabel: "Seinäjoki — Lumo service desk",
      serviceLatitude: 62.7945,
      serviceLongitude: 22.8283,
    },
    create: {
      userId: featuredBikeUser.id,
      slug: "lumo-pyorapaja",
      bio: "Neighborhood bike shop focused on commuter and touring bikes.",
      serviceDescription:
        "Tune-ups, wheel truing, and drivetrain repairs for daily riders.",
      expertise: JSON.stringify(["Bicycles", "Wheel building"]),
      completedJobsCount: bikeJobs.length,
      ratingSum: bikeRatings.ratingSum,
      ratingCount: bikeRatings.ratingCount,
      servicePhotoUrl:
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80",
      serviceLocationLabel: "Seinäjoki — Lumo service desk",
      serviceLatitude: 62.7945,
      serviceLongitude: 22.8283,
    },
  });
  await replaceCompletedJobs(bikeProfile.id, bikeJobs);

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
