"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";

type Props = {
  loggedIn: boolean;
  isRepairer: boolean;
  repairerSlug: string | null;
  accountName: string;
  accountSubtitle: string;
};

export default function HeaderAccountMenu({
  loggedIn,
  isRepairer,
  repairerSlug,
  accountName,
  accountSubtitle,
}: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.accountMenu} ref={menuRef}>
      <button
        type="button"
        className={styles.accountButton}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open account menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.iconWrap} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.accountIcon}
          >
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M4 20c1.6-3.5 4.2-5 8-5s6.4 1.5 8 5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          {loggedIn ? <span className={styles.onlineDot} /> : null}
        </span>
        <span className={styles.accountText}>
          <span className={styles.accountName}>{accountName}</span>
          <span className={styles.accountMeta}>{accountSubtitle}</span>
        </span>
      </button>

      {open ? (
        <div className={styles.menuContent} role="menu">
          {loggedIn ? (
            <>
              {repairerSlug ? (
                <Link href={`/repairers/${repairerSlug}`} className={styles.menuLink} onClick={() => setOpen(false)}>
                  My repair service
                </Link>
              ) : null}
              {isRepairer ? (
                <Link href="/my-repairs" className={styles.menuLink} onClick={() => setOpen(false)}>
                  My repairs
                </Link>
              ) : null}
              {!isRepairer ? (
                <Link href="/my-items" className={styles.menuLink} onClick={() => setOpen(false)}>
                  My items
                </Link>
              ) : null}
              <Link href="/listings" className={styles.menuLink} onClick={() => setOpen(false)}>
                Browse listings
              </Link>
              <a href="/api/auth/logout" className={styles.menuLink} onClick={() => setOpen(false)}>
                Log out
              </a>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.menuLink} onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link href="/signup" className={styles.menuLink} onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
