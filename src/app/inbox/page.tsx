import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import styles from "./inbox.module.css";

export default async function InboxPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/inbox");
  }

  const asRepairer = await prisma.repairStory.findMany({
    where: { repairerUserId: session.userId },
    orderBy: { updatedAt: "desc" },
    take: 40,
    include: {
      listing: { select: { id: true, title: true } },
    },
  });

  const asCustomer = await prisma.repairStory.findMany({
    where: { listing: { authorId: session.userId } },
    orderBy: { updatedAt: "desc" },
    take: 40,
    include: {
      listing: { select: { id: true, title: true } },
      repairer: { select: { name: true, email: true } },
    },
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Inbox</h1>
      <p className={styles.lead}>
        Repair stories you lead as a repairer, and stories on your own listings. Statuses and payments are still a
        first draft — we will refine the flow as FIKS grows.
      </p>

      <section className={styles.section} aria-label="Stories as repairer">
        <h2 className={styles.sectionTitle}>As repairer</h2>
        {asRepairer.length === 0 ? (
          <p className={styles.empty}>No repair stories yet. Apply from an open listing.</p>
        ) : (
          <ul className={styles.list}>
            {asRepairer.map((s) => (
              <li key={s.id} className={styles.row}>
                <Link href={`/repair-stories/${s.id}`} className={styles.storyLink}>
                  {s.listing.title}
                </Link>
                <span className={styles.meta}>
                  Story <code className={styles.code}>{s.id.slice(0, 8)}</code> · {s.status.replace(/_/g, " ")}
                </span>
                <Link href={`/listings/${s.listing.id}`} className={styles.sideLink}>
                  Case
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section} aria-label="Stories on your listings">
        <h2 className={styles.sectionTitle}>On your listings</h2>
        {asCustomer.length === 0 ? (
          <p className={styles.empty}>No repairers have applied to your listings yet.</p>
        ) : (
          <ul className={styles.list}>
            {asCustomer.map((s) => (
              <li key={s.id} className={styles.row}>
                <Link href={`/repair-stories/${s.id}`} className={styles.storyLink}>
                  {s.listing.title}
                </Link>
                <span className={styles.meta}>
                  {s.repairer.name ?? s.repairer.email} · {s.status.replace(/_/g, " ")}
                </span>
                <Link href={`/listings/${s.listing.id}`} className={styles.sideLink}>
                  Case
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className={styles.footerLinks}>
        <Link href="/listings" className="btn btn-primary">
          Browse listings
        </Link>
        <Link href="/create-listing" className="btn btn-secondary">
          Post a listing
        </Link>
      </div>
    </div>
  );
}
