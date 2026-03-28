import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
      </article>
    </div>
  );
}
