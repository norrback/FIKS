"use client";

import React, { useState } from "react";
import styles from "./repairer-service.module.css";

export type RepairerServiceInitial = {
  slug: string;
  displayName: string;
  bio: string;
  serviceDescription: string;
  expertise: string[];
  completedJobsCount: number;
  ratingSum: number;
  ratingCount: number;
};

type Props = {
  initial: RepairerServiceInitial;
  isOwner: boolean;
};

function formatAverage(ratingSum: number, ratingCount: number): string | null {
  if (ratingCount <= 0) return null;
  return (Math.round((ratingSum / ratingCount) * 10) / 10).toFixed(1);
}

function splitExpertise(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function RepairerServiceClient({ initial, isOwner }: Props) {
  const [bio, setBio] = useState(initial.bio);
  const [serviceDescription, setServiceDescription] = useState(initial.serviceDescription);
  const [expertiseText, setExpertiseText] = useState(initial.expertise.join(", "));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    completedJobsCount: initial.completedJobsCount,
    ratingSum: initial.ratingSum,
    ratingCount: initial.ratingCount,
  });
  const [snapshot, setSnapshot] = useState<{
    bio: string;
    serviceDescription: string;
    expertiseText: string;
  } | null>(null);

  const avg = formatAverage(stats.ratingSum, stats.ratingCount);
  const expertiseTags = splitExpertise(expertiseText);

  function startEditing() {
    setSnapshot({ bio, serviceDescription, expertiseText });
    setError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/repairers/${encodeURIComponent(initial.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          serviceDescription,
          expertise: expertiseText,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        bio?: string;
        serviceDescription?: string;
        expertise?: string[];
        completedJobsCount?: number;
        ratingSum?: number;
        ratingCount?: number;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not save changes.");
        return;
      }
      if (typeof data.bio === "string") setBio(data.bio);
      if (typeof data.serviceDescription === "string") setServiceDescription(data.serviceDescription);
      if (Array.isArray(data.expertise)) setExpertiseText(data.expertise.join(", "));
      if (typeof data.completedJobsCount === "number") {
        setStats((s) => ({ ...s, completedJobsCount: data.completedJobsCount! }));
      }
      if (typeof data.ratingSum === "number" && typeof data.ratingCount === "number") {
        setStats((s) => ({ ...s, ratingSum: data.ratingSum!, ratingCount: data.ratingCount! }));
      }
      setSnapshot(null);
      setEditing(false);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (snapshot) {
      setBio(snapshot.bio);
      setServiceDescription(snapshot.serviceDescription);
      setExpertiseText(snapshot.expertiseText);
    }
    setSnapshot(null);
    setError(null);
    setEditing(false);
  }

  return (
    <div className={styles.layout}>
      <header className={styles.head}>
        <div className={styles.headRow}>
          <div>
            <h1 className={styles.title}>{initial.displayName}</h1>
            <p className={styles.subtitle}>Repair service on FIKS</p>
          </div>
          {isOwner && !editing ? (
            <button type="button" className={styles.editBtn} onClick={startEditing}>
              Edit profile
            </button>
          ) : null}
        </div>
      </header>

      <section className={styles.stats} aria-label="Repair job statistics">
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.completedJobsCount}</span>
          <span className={styles.statLabel}>Completed jobs</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{avg ?? "—"}</span>
          <span className={styles.statLabel}>
            {avg ? `Average score (${stats.ratingCount} rated)` : "Average score"}
          </span>
        </div>
      </section>

      {isOwner && editing ? (
        <form className={styles.card} onSubmit={handleSave}>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              className={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              disabled={saving}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="serviceDescription">
              Service description
            </label>
            <textarea
              id="serviceDescription"
              className={styles.textarea}
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              rows={5}
              placeholder="How you work, what customers can expect, turnaround, etc."
              disabled={saving}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="expertise">
              Expertise
            </label>
            <input
              id="expertise"
              className={styles.input}
              value={expertiseText}
              onChange={(e) => setExpertiseText(e.target.value)}
              placeholder="Comma-separated, e.g. Electronics, Bicycles, Furniture"
              disabled={saving}
            />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Expertise</h2>
            {expertiseTags.length === 0 ? (
              <p className={styles.muted}>
                {isOwner ? "Add expertise when you edit your profile." : "No expertise listed yet."}
              </p>
            ) : (
              <ul className={styles.tags}>
                {expertiseTags.map((tag) => (
                  <li key={tag} className={styles.tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Bio</h2>
            {bio ? (
              <p className={styles.bodyText}>{bio}</p>
            ) : (
              <p className={styles.muted}>{isOwner ? "Add a bio when you edit your profile." : "No bio yet."}</p>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Service</h2>
            {serviceDescription ? (
              <p className={styles.bodyText}>{serviceDescription}</p>
            ) : (
              <p className={styles.muted}>
                {isOwner ? "Describe your service when you edit your profile." : "No service description yet."}
              </p>
            )}
          </section>
        </>
      )}

      {!isOwner && !avg && stats.completedJobsCount === 0 ? (
        <p className={styles.note}>This repairer has not completed rated jobs on FIKS yet.</p>
      ) : null}
    </div>
  );
}
