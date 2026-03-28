"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./Header.module.css";

type Props = { loggedIn: boolean };

export default function HeaderSearch({ loggedIn }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (pathname === "/listings") {
      setQ(searchParams.get("q") ?? "");
    } else {
      setQ("");
    }
  }, [pathname, searchParams]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = q.trim();
    const listingsPath =
      "/listings" + (query ? `?q=${encodeURIComponent(query)}` : "");

    if (!loggedIn) {
      router.push("/login?next=" + encodeURIComponent(listingsPath));
      return;
    }
    router.push(listingsPath);
  }

  return (
    <form
      className={styles.search}
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search listings"
    >
      <input
        type="search"
        name="q"
        placeholder="Search for repairers or broken parts..."
        className={styles.searchInput}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search listings"
        enterKeyHint="search"
      />
    </form>
  );
}
