import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import HeaderSearch from "./HeaderSearch";
import HeaderSearchFallback from "./HeaderSearchFallback";
import HeaderAccountMenu from "./HeaderAccountMenu";
import styles from "./Header.module.css";

export default async function Header() {
  const session = await getSession();
  const loggedIn = Boolean(session);

  let repairerSlug: string | null = null;
  let serviceName: string | null = null;
  let isRepairer = false;
  let accountName = "Guest";
  let accountSubtitle = "Not signed in";
  if (session) {
    let user:
      | {
          name: string | null;
          email: string;
          role: string;
          repairerProfile: { slug: string; serviceName: string } | null;
        }
      | {
          name: string | null;
          email: string;
          role: string;
          repairerProfile: { slug: string } | null;
        }
      | null = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          name: true,
          email: true,
          role: true,
          repairerProfile: {
            select: {
              slug: true,
              serviceName: true,
            },
          },
        },
      });
    } catch {
      // Dev fallback for stale Prisma client instances during HMR.
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          name: true,
          email: true,
          role: true,
          repairerProfile: {
            select: {
              slug: true,
            },
          },
        },
      });
    }
    repairerSlug = user?.repairerProfile?.slug ?? null;
    isRepairer = user?.role === "REPAIRER";
    serviceName =
      "serviceName" in (user?.repairerProfile ?? {})
        ? user?.repairerProfile?.serviceName?.trim() || null
        : null;

    const userName = user?.name?.trim() || user?.email || session.email;
    accountName = serviceName || userName;
    accountSubtitle = user?.role === "REPAIRER" ? "Service account" : "Customer account";
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
          <HeaderAccountMenu
            loggedIn={loggedIn}
            isRepairer={isRepairer}
            repairerSlug={repairerSlug}
            accountName={accountName}
            accountSubtitle={accountSubtitle}
          />
        </div>
      </div>
    </header>
  );
}
