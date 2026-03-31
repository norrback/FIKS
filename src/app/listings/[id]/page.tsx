import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parsePhotoUrls } from "@/lib/listingPhotos";
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

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  if (!listing) {
    notFound();
  }
  const photoUrls = parsePhotoUrls(listing.photoUrlsJson);

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
        <section className={styles.caseBlock} aria-label="Listing details">
          <ListingDetailViewer description={listing.description} photoUrls={photoUrls} />

          <p className={styles.caseId}>
            <strong>Case ID:</strong> {listing.id}
          </p>
        </section>
      </article>
    </div>
  );
}
