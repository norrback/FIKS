import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import MyRepairsClient, { type RepairStoryListItem } from "./MyRepairsClient";
import styles from "./my-repairs.module.css";

export default async function MyRepairsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=" + encodeURIComponent("/my-repairs"));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (!user || user.role !== "REPAIRER") {
    redirect("/listings");
  }

  const stories = await prisma.repairStory.findMany({
    where: { repairerUserId: session.userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      agreedPriceCents: true,
      jobCompletedAt: true,
      paidAt: true,
      closedReason: true,
      listing: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  const initialStories: RepairStoryListItem[] = stories.map((s) => ({
    id: s.id,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    agreedPriceCents: s.agreedPriceCents,
    jobCompletedAt: s.jobCompletedAt?.toISOString() ?? null,
    paidAt: s.paidAt?.toISOString() ?? null,
    closedReason: s.closedReason,
    listingId: s.listing.id,
    listingTitle: s.listing.title,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>My repairs</h1>
          <p className={styles.subtitle}>
            Track all your repair stories in one place, then filter by status or search by keyword.
          </p>
          <Link href="/listings" className={styles.backLink}>
            Browse listings
          </Link>
        </header>

        <MyRepairsClient initialStories={initialStories} />
      </div>
    </div>
  );
}
