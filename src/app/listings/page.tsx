import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LISTING_CATEGORY_TREE } from "@/lib/listingCategories";
import { parsePhotoUrls } from "@/lib/listingPhotos";
import { APPLICATION_BLOCKING_REPAIR_STORY_STATUSES, getEffectiveListingStatus } from "@/lib/repairStoryStatus";
import ListingsGrid, { type ListingGridItem } from "./ListingsGrid";
import styles from "./listings.module.css";

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function ListingsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/listings");
  }

  const { q: qRaw, category: categoryRaw } = await searchParams;
  const q = (qRaw ?? "").trim();
  const category = (categoryRaw ?? "").trim().toUpperCase();

  const listings = await prisma.listing.findMany({
    where: {
      status: "OPEN",
      repairStories: {
        none: {
          status: { in: [...APPLICATION_BLOCKING_REPAIR_STORY_STATUSES] },
        },
      },
      ...(category ? { mainCategory: category } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { location: { contains: q } },
              { postalCode: { contains: q } },
              { locationName: { contains: q } },
              { mainCategory: { contains: q.toUpperCase() } },
              { subCategory: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      repairStories: { select: { status: true } },
    },
  });

  const listingCards: ListingGridItem[] = listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    description: listing.description,
    location: listing.location,
    postalCode: listing.postalCode || "",
    locationName: listing.locationName || "",
    status: getEffectiveListingStatus(
      listing.status,
      listing.repairStories.map((s) => s.status),
    ),
    mainCategory: listing.mainCategory || "UNCATEGORIZED",
    subCategory: listing.subCategory || "",
    authorName: listing.author.name ?? listing.author.email,
    photoUrls: parsePhotoUrls(listing.photoUrlsJson),
    createdAt: listing.createdAt.toISOString(),
  }));

  return (
    <div className={styles.container}>
      <header className={styles.head}>
        <h1 className={styles.title}>Listings</h1>
        <p className={styles.subtitle}>
          Signed in as {session.email}.{" "}
          {q ? (
            <>
              Results matching &ldquo;{q}&rdquo;.
              {" "}
              <Link href="/listings" className={styles.clearSearch}>
                Clear search
              </Link>
            </>
          ) : (
            "Open repair requests from the community."
          )}
        </p>
        <div className={styles.categoryFilters}>
          <Link
            href={q ? `/listings?q=${encodeURIComponent(q)}` : "/listings"}
            className={`${styles.categoryFilter} ${!category ? styles.categoryFilterActive : ""}`}
          >
            All
          </Link>
          {Object.keys(LISTING_CATEGORY_TREE).map((c) => (
            <Link
              key={c}
              href={q ? `/listings?category=${encodeURIComponent(c)}&q=${encodeURIComponent(q)}` : `/listings?category=${encodeURIComponent(c)}`}
              className={`${styles.categoryFilter} ${category === c ? styles.categoryFilterActive : ""}`}
            >
              {c.charAt(0) + c.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>
      </header>

      {listings.length === 0 ? (
        <div className={styles.empty}>
          <p>{q ? "No listings match your search." : "No listings yet."}</p>
          <p style={{ marginTop: "0.75rem" }}>
            <Link href="/create-listing" className={styles.emptyLink}>
              Post the first listing
            </Link>
          </p>
        </div>
      ) : (
        <ListingsGrid listings={listingCards} />
      )}
    </div>
  );
}
