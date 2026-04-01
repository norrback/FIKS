import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parsePhotoUrls } from "@/lib/listingPhotos";
import {
  getEffectiveListingStatus,
  isApplicationBlockedByRepairStoryStatus,
  isTerminalRepairStoryStatus,
} from "@/lib/repairStoryStatus";
import ListingApplyCase from "./ListingApplyCase";
import ListingDetailViewer from "./ListingDetailViewer";
import styles from "./listing-detail.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: Props) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    redirect("/login?next=" + encodeURIComponent(`/listings/${id}`));
  }

  const viewer = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true },
  });
  if (!viewer) {
    redirect("/login?next=" + encodeURIComponent(`/listings/${id}`));
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true } },
      repairStories: {
        orderBy: { createdAt: "desc" },
        include: {
          repairer: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }
  const photoUrls = parsePhotoUrls(listing.photoUrlsJson);
  const isAuthor = listing.authorId === session.userId;
  const stories = listing.repairStories;
  const viewerStories = stories.filter((s) => s.repairerUserId === session.userId);
  const activeStory = viewerStories.find((s) => !isTerminalRepairStoryStatus(s.status));
  const latestTerminalStory = viewerStories.find((s) => isTerminalRepairStoryStatus(s.status));

  const hasApplicationBlockingStory = stories.some((s) => isApplicationBlockedByRepairStoryStatus(s.status));
  const effectiveStatus = getEffectiveListingStatus(
    listing.status,
    stories.map((s) => s.status),
  );

  const canApply =
    viewer.role === "REPAIRER" &&
    !isAuthor &&
    !hasApplicationBlockingStory &&
    listing.status.toUpperCase() === "OPEN";

  const blockedReason = hasApplicationBlockingStory
    ? stories.length > 1
      ? "Repaire agreed elsewhere."
      : "A repair has already been agreed for this case."
    : null;

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/listings" className={styles.backLink}>
          ← All listings
        </Link>
      </nav>

      <article className={styles.article}>
        <header className={styles.head}>
          <h1 className={styles.title}>{listing.title}</h1>
          <p className={styles.meta}>
            {listing.location ?? "Location not set"}
            {" · "}
            {listing.author.name ?? listing.author.email}
            {" · "}
            <span className={styles.status}>{effectiveStatus.replace(/_/g, " ")}</span>
          </p>
        </header>
        <section className={styles.caseBlock} aria-label="Listing details">
          <ListingDetailViewer description={listing.description} photoUrls={photoUrls} />

          <p className={styles.caseId}>
            <strong>Case ID:</strong> {listing.id}
          </p>

          <p className={styles.caseNote}>
            <strong>Case status:</strong> <span className={styles.status}>{effectiveStatus.replace(/_/g, " ")}</span>
          </p>

          <h2 className={styles.caseStoriesTitle}>Service provider actions</h2>
          <ListingApplyCase
            listingId={listing.id}
            canApply={canApply}
            blockedReason={blockedReason}
            branchFromStoryId={latestTerminalStory?.status !== "PAID" ? latestTerminalStory?.id : undefined}
            activeStoryId={activeStory?.id}
          />
        </section>
      </article>
    </div>
  );
}
