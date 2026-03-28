import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import styles from "./inbox.module.css";

export default async function InboxPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/inbox");
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Inbox</h1>
      <p className={styles.lead}>
        Messaging, job updates, and secure payments will show up here. This area is not wired up yet.
      </p>
      <p className={styles.hint}>
        Until then, browse open repair requests or post your own.
      </p>
      <div className={styles.actions}>
        <Link href="/listings" className="btn btn-primary">
          Search listings
        </Link>
        <Link href="/create-listing" className="btn btn-secondary">
          Post a listing
        </Link>
      </div>
    </div>
  );
}
