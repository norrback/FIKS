import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import styles from "./listings.module.css";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ListingsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/listings");
  }

  const { q: qRaw } = await searchParams;
  const q = (qRaw ?? "").trim();

  const listings = await prisma.listing.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { location: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

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
        <ul className={styles.list}>
          {listings.map((listing) => (
            <li key={listing.id} className={styles.listItem}>
              <Link href={`/listings/${listing.id}`} className={`${styles.card} ${styles.cardLink}`}>
                <h2 className={styles.cardTitle}>{listing.title}</h2>
                <p className={styles.cardMeta}>
                  {listing.location ?? "Location not set"}
                  {" · "}
                  {listing.author.name ?? listing.author.email}
                </p>
                <p className={styles.cardDesc}>{listing.description}</p>
                <span className={styles.status}>{listing.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
