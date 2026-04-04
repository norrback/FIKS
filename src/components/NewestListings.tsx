import Link from "next/link";
import { prisma } from "@/lib/db";
import { parsePhotoUrls } from "@/lib/listingPhotos";
import { APPLICATION_BLOCKING_REPAIR_STORY_STATUSES, getEffectiveListingStatus } from "@/lib/repairStoryStatus";
import styles from "./NewestListings.module.css";

const LISTING_PREVIEW_LIMIT = 6;

function truncateText(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function formatListedDate(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(d);
}

function headerClassForIndex(i: number): string {
  const classes = [styles.cardHeaderA, styles.cardHeaderB, styles.cardHeaderC];
  return classes[i % classes.length] ?? styles.cardHeaderA;
}

export default async function NewestListings() {
  const listings = await prisma.listing.findMany({
    where: {
      status: "OPEN",
      repairStories: {
        none: {
          status: { in: [...APPLICATION_BLOCKING_REPAIR_STORY_STATUSES] },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: LISTING_PREVIEW_LIMIT,
    include: {
      author: { select: { name: true, email: true } },
      repairStories: { select: { status: true } },
    },
  });

  return (
    <section className={styles.section} aria-labelledby="newest-listings-heading">
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Latest listings</p>
            <h2 id="newest-listings-heading" className={styles.title}>
              Newest repair requests
            </h2>
            <p className={styles.subtitle}>
              Recently posted items from the community. Sign in to browse the full catalog and connect with repairers.
            </p>
          </div>
          <Link href="/login?next=%2Flistings" className={styles.viewAll}>
            View all listings
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className={styles.empty}>
            <p>No open listings yet.</p>
            <p className={styles.emptyHint}>
              <Link href="/signup" className={styles.emptyLink}>
                Create an account
              </Link>{" "}
              to post a broken item.
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {listings.map((listing, index) => {
              const photos = parsePhotoUrls(listing.photoUrlsJson);
              const thumb = photos[0] ?? null;
              const authorName = listing.author.name ?? listing.author.email;
              const effectiveStatus = getEffectiveListingStatus(
                listing.status,
                listing.repairStories.map((s) => s.status),
              );
              const locationLine =
                listing.postalCode || listing.locationName
                  ? [listing.postalCode, listing.locationName].filter(Boolean).join(" ")
                  : listing.location ?? "";
              const categoryLabel =
                listing.mainCategory || listing.subCategory
                  ? [listing.mainCategory, listing.subCategory].filter(Boolean).join(" · ")
                  : "Uncategorized";
              const placeholderInitials = (listing.mainCategory || listing.subCategory
                ? categoryLabel
                : listing.title
              )
                .slice(0, 2)
                .toUpperCase();

              return (
                <Link key={listing.id} href={`/listings/${listing.id}`} className={styles.card}>
                  <div className={styles.photoWrap}>
                    {thumb ? (
                      <img src={thumb} alt="" className={styles.photo} loading="lazy" />
                    ) : (
                      <div className={`${styles.cardHeader} ${headerClassForIndex(index)}`}>
                        <span className={styles.avatar} aria-hidden>
                          {placeholderInitials}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <p className={styles.categoryPill}>{categoryLabel}</p>
                    <h3 className={styles.cardTitle}>{listing.title}</h3>
                    <p className={styles.tagline}>{truncateText(listing.description, 140)}</p>
                    <div className={styles.meta}>
                      <span>{locationLine || "Location not set"}</span>
                      <span>{formatListedDate(listing.createdAt)}</span>
                    </div>
                    <div className={styles.footerRow}>
                      <span className={styles.author}>{authorName}</span>
                      <span className={styles.status}>{effectiveStatus.replace(/_/g, " ")}</span>
                    </div>
                    <span className={styles.cardLink}>Open listing →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
