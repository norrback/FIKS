import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import HeaderSearch from "./HeaderSearch";
import HeaderSearchFallback from "./HeaderSearchFallback";
import styles from "./Header.module.css";

export default async function Header() {
  const session = await getSession();
  const loggedIn = Boolean(session);

  let repairerSlug: string | null = null;
  if (session) {
    const row = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true, repairerProfile: true },
    });
    if (row?.role === "REPAIRER" && row.repairerProfile) {
      repairerSlug = row.repairerProfile.slug;
    }
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/fiks_logo.avif" alt="FIKS." width={0} height={0} sizes="100vw" style={{ width: "auto", height: "36px" }} priority />
        </Link>

        <Suspense fallback={<HeaderSearchFallback />}>
          <HeaderSearch loggedIn={loggedIn} />
        </Suspense>

        <div className={styles.actions}>
          {session ? (
            <>
              {repairerSlug ? (
                <Link href={`/repairers/${repairerSlug}`} className={styles.loginLink}>
                  My repair service
                </Link>
              ) : null}
              <Link href="/listings" className={styles.loginLink}>
                Listings
              </Link>
              <a href="/api/auth/logout" className={styles.loginLink}>
                Log out
              </a>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginLink}>
                Log in
              </Link>
              <Link href="/signup" className={styles.loginLink}>
                Sign up
              </Link>
            </>
          )}
          <Link href="/create-listing" className="btn btn-primary">
            Post a Listing
          </Link>
        </div>
      </div>
    </header>
  );
}
