"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { REPAIR_STORY_STATUSES } from "@/lib/repairStoryStatus";
import styles from "./my-repairs.module.css";

export type RepairStoryListItem = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  agreedPriceCents: number | null;
  jobCompletedAt: string | null;
  paidAt: string | null;
  closedReason: string | null;
  listingId: string;
  listingTitle: string;
};

type Props = {
  initialStories: RepairStoryListItem[];
};

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatPrice(cents: number | null): string {
  if (cents == null) return "—";
  return `EUR ${(cents / 100).toFixed(2)}`;
}

export default function MyRepairsClient({ initialStories }: Props) {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");

  const keywordNormalized = keyword.trim().toLowerCase();

  const stories = useMemo(() => {
    return initialStories.filter((story) => {
      if (statusFilter !== "ALL" && story.status !== statusFilter) return false;
      if (!keywordNormalized) return true;

      const haystack = [
        story.id,
        story.status,
        story.listingId,
        story.listingTitle,
        story.closedReason ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(keywordNormalized);
    });
  }, [initialStories, keywordNormalized, statusFilter]);

  const statusCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of initialStories) {
      map.set(item.status, (map.get(item.status) ?? 0) + 1);
    }
    return map;
  }, [initialStories]);

  return (
    <section className={styles.panel}>
      <div className={styles.controls}>
        <div className={styles.control}>
          <label htmlFor="statusFilter" className={styles.label}>
            Status
          </label>
          <select
            id="statusFilter"
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All statuses ({initialStories.length})</option>
            {REPAIR_STORY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)} ({statusCounts.get(status) ?? 0})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.control}>
          <label htmlFor="keywordFilter" className={styles.label}>
            Search
          </label>
          <input
            id="keywordFilter"
            className={styles.input}
            type="search"
            placeholder="Search case title, IDs, status, reason..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      <p className={styles.resultText}>
        Showing {stories.length} of {initialStories.length} repair stories
      </p>

      {stories.length === 0 ? (
        <p className={styles.empty}>
          No repair stories match your filters yet. Try another status or keyword.
        </p>
      ) : (
        <ul className={styles.list}>
          {stories.map((story) => (
            <li key={story.id} className={styles.card}>
              <div className={styles.row}>
                <span className={styles.badge}>{statusLabel(story.status)}</span>
                <span className={styles.meta}>Updated {formatDate(story.updatedAt)}</span>
              </div>

              <h2 className={styles.cardTitle}>{story.listingTitle}</h2>
              <p className={styles.meta}>
                Case ID: {story.listingId} · Story ID: {story.id}
              </p>
              <p className={styles.meta}>
                Agreed price: {formatPrice(story.agreedPriceCents)}
                {story.jobCompletedAt ? ` · Done ${formatDate(story.jobCompletedAt)}` : ""}
                {story.paidAt ? ` · Paid ${formatDate(story.paidAt)}` : ""}
              </p>
              {story.closedReason ? <p className={styles.closedReason}>Reason: {story.closedReason}</p> : null}

              <div className={styles.actions}>
                <Link href={`/repair-stories/${story.id}`} className={styles.linkBtn}>
                  Open repair story
                </Link>
                <Link href={`/listings/${story.listingId}`} className={styles.textLink}>
                  Open case
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
