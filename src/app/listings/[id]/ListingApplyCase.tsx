"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import styles from "./listing-detail.module.css";

type Props = {
  listingId: string;
  canApply: boolean;
  /** When set, POST includes branchedFromId (previous closed story). */
  branchFromStoryId?: string;
  activeStoryId?: string;
};

export default function ListingApplyCase({ listingId, canApply, branchFromStoryId, activeStoryId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function apply() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/${encodeURIComponent(listingId)}/repair-stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchFromStoryId ? { branchedFromId: branchFromStoryId } : {}),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; id?: string; storyId?: string };
      if (res.status === 409 && data.storyId) {
        router.push(`/repair-stories/${data.storyId}`);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Could not apply.");
        return;
      }
      const newId = data.id;
      if (newId) {
        router.push(`/repair-stories/${newId}`);
        router.refresh();
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  if (activeStoryId) {
    return (
      <div className={styles.caseActions}>
        <p className={styles.caseHint}>You have an open repair story on this case.</p>
        <Link href={`/repair-stories/${activeStoryId}`} className={styles.caseLink}>
          Open your repair story
        </Link>
      </div>
    );
  }

  if (!canApply) {
    return null;
  }

  return (
    <div className={styles.caseActions}>
      {error ? (
        <p className={styles.caseError} role="alert">
          {error}
        </p>
      ) : null}
      <button type="button" className={styles.applyBtn} onClick={() => void apply()} disabled={loading}>
        {loading ? "Applying…" : branchFromStoryId ? "Start new repair attempt (branch)" : "Apply to this case"}
      </button>
      {branchFromStoryId ? (
        <p className={styles.caseHint}>
          Continues from a previous closed story. Your item-level and per-story threads stay separate.
        </p>
      ) : null}
    </div>
  );
}
