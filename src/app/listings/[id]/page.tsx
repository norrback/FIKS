import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isTerminalRepairStoryStatus } from "@/lib/repairStoryStatus";
import ListingApplyCase from "./ListingApplyCase";
import ListingItemThread, { type ListingThreadMessage } from "./ListingItemThread";
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

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  if (!listing) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  const isAuthor = listing.authorId === session.userId;
  const isRepairer = user?.role === "REPAIRER";

  const visibleStories = isAuthor
    ? await prisma.repairStory.findMany({
        where: { listingId: listing.id },
        orderBy: { createdAt: "desc" },
        include: { repairer: { select: { id: true, name: true, email: true } } },
      })
    : isRepairer
      ? await prisma.repairStory.findMany({
          where: { listingId: listing.id, repairerUserId: session.userId },
          orderBy: { createdAt: "desc" },
          include: { repairer: { select: { id: true, name: true, email: true } } },
        })
      : [];

  const activeStory = visibleStories.find((s) => !isTerminalRepairStoryStatus(s.status));
  const latestClosedForBranch = visibleStories.find(
    (s) => s.status === "CLOSED_CANNOT_FIX" || s.status === "CLOSED_CANCELLED",
  );

  const canApply = Boolean(isRepairer && !isAuthor && !activeStory);
  const branchFromStoryId = canApply && latestClosedForBranch ? latestClosedForBranch.id : undefined;

  const canListingChat =
    isAuthor || (isRepairer && visibleStories.length > 0);

  let listingMessages: ListingThreadMessage[] = [];
  if (canListingChat) {
    const msgs = await prisma.listingMessage.findMany({
      where: { listingId: listing.id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { id: true, name: true, email: true } } },
    });
    listingMessages = msgs.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      sender: m.sender,
    }));
  }

  const showStoryList = isAuthor || (isRepairer && visibleStories.length > 0);

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
            <span className={styles.status}>{listing.status}</span>
          </p>
        </header>
        <div className={styles.body}>
          <h2 className={styles.sectionLabel}>What&apos;s wrong</h2>
          <p className={styles.description}>{listing.description}</p>
        </div>

        <section className={styles.caseBlock} aria-label="Case and repair stories">
          <h2 className={styles.sectionLabel}>Case &amp; repair flow</h2>
          <p className={styles.caseId}>
            <strong>Case (item) ID:</strong> {listing.id}
          </p>
          <p className={styles.caseNote}>
            Each repair attempt uses its own <strong>repair story ID</strong> (see inbox or apply below). Multiple
            repairers mean multiple stories on the same case. Escrow and payouts are not connected yet — fields exist
            for the next iteration.
          </p>

          {showStoryList ? (
            <>
              <h3 className={styles.caseStoriesTitle}>Repair stories on this case</h3>
              <ul className={styles.caseStoryList}>
                {visibleStories.map((s) => (
                  <li key={s.id} className={styles.caseStoryRow}>
                    <span>
                      <Link href={`/repair-stories/${s.id}`} className={styles.caseLink}>
                        Story {s.id.slice(0, 8)}…
                      </Link>
                      {isAuthor ? (
                        <span className={styles.caseStoryMeta}>
                          {" "}
                          · {s.repairer.name ?? s.repairer.email} · {s.status.replace(/_/g, " ")}
                        </span>
                      ) : (
                        <span className={styles.caseStoryMeta}> · {s.status.replace(/_/g, " ")}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {isRepairer && !isAuthor ? (
            <ListingApplyCase
              listingId={listing.id}
              canApply={canApply}
              branchFromStoryId={branchFromStoryId}
              activeStoryId={activeStory?.id}
            />
          ) : null}

          {canListingChat ? (
            <>
              <h3 className={styles.caseStoriesTitle}>Case-wide messages</h3>
              <p className={styles.caseNote}>
                Visible to you, the listing owner, and repairers who already have a story here. Use per-story threads
                for quotes, agreements, and repair details.
              </p>
              <ListingItemThread listingId={listing.id} initialMessages={listingMessages} />
            </>
          ) : null}
        </section>
      </article>
    </div>
  );
}
