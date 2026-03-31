"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./repairer-service.module.css";
import { DEFAULT_SERVICE_MAP, repairerOsmEmbedSrc } from "@/lib/repairerMapEmbed";

export type CompletedJobInitial = {
  id: string;
  title: string;
  itemSummary: string;
  completedAt: string;
  ratingStars: number | null;
  agreementSummary: string;
  messagesSummary: string;
  repairStoryNotes: string;
};

export type RepairerServiceInitial = {
  slug: string;
  displayName: string;
  serviceName: string;
  bio: string;
  serviceDescription: string;
  expertise: string[];
  completedJobsCount: number;
  ratingSum: number;
  ratingCount: number;
  servicePhotoUrl: string | null;
  serviceLocationLabel: string;
  serviceLatitude: number | null;
  serviceLongitude: number | null;
  completedJobs: CompletedJobInitial[];
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

function formatJobDate(iso: string): string {
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

export default function RepairerServiceClient({ initial, isOwner }: Props) {
  const router = useRouter();
  const [serviceName, setServiceName] = useState(initial.serviceName);
  const [bio, setBio] = useState(initial.bio);
  const [serviceDescription, setServiceDescription] = useState(initial.serviceDescription);
  const [expertiseText, setExpertiseText] = useState(initial.expertise.join(", "));
  const [servicePhotoUrl, setServicePhotoUrl] = useState(initial.servicePhotoUrl ?? "");
  const [serviceLocationLabel, setServiceLocationLabel] = useState(initial.serviceLocationLabel);
  const [serviceLatitudeInput, setServiceLatitudeInput] = useState(
    initial.serviceLatitude != null ? String(initial.serviceLatitude) : "",
  );
  const [serviceLongitudeInput, setServiceLongitudeInput] = useState(
    initial.serviceLongitude != null ? String(initial.serviceLongitude) : "",
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoBroken, setPhotoBroken] = useState(false);
  const [stats, setStats] = useState({
    completedJobsCount: initial.completedJobsCount,
    ratingSum: initial.ratingSum,
    ratingCount: initial.ratingCount,
  });
  const [snapshot, setSnapshot] = useState<{
    serviceName: string;
    bio: string;
    serviceDescription: string;
    expertiseText: string;
    servicePhotoUrl: string;
    serviceLocationLabel: string;
    serviceLatitudeInput: string;
    serviceLongitudeInput: string;
  } | null>(null);

  const jobsKey = initial.completedJobs.map((j) => j.id).join("|");

  useEffect(() => {
    if (editing) return;
    setServiceName(initial.serviceName);
    setBio(initial.bio);
    setServiceDescription(initial.serviceDescription);
    setExpertiseText(initial.expertise.join(", "));
    setServicePhotoUrl(initial.servicePhotoUrl ?? "");
    setServiceLocationLabel(initial.serviceLocationLabel);
    setServiceLatitudeInput(initial.serviceLatitude != null ? String(initial.serviceLatitude) : "");
    setServiceLongitudeInput(initial.serviceLongitude != null ? String(initial.serviceLongitude) : "");
    setStats({
      completedJobsCount: initial.completedJobsCount,
      ratingSum: initial.ratingSum,
      ratingCount: initial.ratingCount,
    });
    setPhotoBroken(false);
  }, [
    editing,
    initial.slug,
    initial.serviceName,
    initial.bio,
    initial.serviceDescription,
    initial.expertise.join(","),
    initial.servicePhotoUrl,
    initial.serviceLocationLabel,
    initial.serviceLatitude,
    initial.serviceLongitude,
    initial.completedJobsCount,
    initial.ratingSum,
    initial.ratingCount,
    jobsKey,
  ]);

  const avg = formatAverage(stats.ratingSum, stats.ratingCount);
  const expertiseTags = splitExpertise(expertiseText);
  const completedJobs = initial.completedJobs;
  const jobsListed = completedJobs.length;

  const parsedPreviewLat = Number(serviceLatitudeInput.trim());
  const parsedPreviewLng = Number(serviceLongitudeInput.trim());
  const previewCoordsValid =
    serviceLatitudeInput.trim() !== "" &&
    serviceLongitudeInput.trim() !== "" &&
    Number.isFinite(parsedPreviewLat) &&
    Number.isFinite(parsedPreviewLng);

  const mapLat = previewCoordsValid
    ? parsedPreviewLat
    : (initial.serviceLatitude ?? DEFAULT_SERVICE_MAP.latitude);
  const mapLng = previewCoordsValid
    ? parsedPreviewLng
    : (initial.serviceLongitude ?? DEFAULT_SERVICE_MAP.longitude);

  const mapSrc = useMemo(() => repairerOsmEmbedSrc(mapLat, mapLng), [mapLat, mapLng]);

  const hasSavedPin = initial.serviceLatitude != null && initial.serviceLongitude != null;
  const displayLocationLabel = serviceLocationLabel.trim() || "Approximate service area";

  const osmLink = useMemo(
    () => `https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLng}#map=15/${mapLat}/${mapLng}`,
    [mapLat, mapLng],
  );

  const photoSrc = servicePhotoUrl.trim() || initial.servicePhotoUrl || "";

  function startEditing() {
    setSnapshot({
      serviceName,
      bio,
      serviceDescription,
      expertiseText,
      servicePhotoUrl,
      serviceLocationLabel,
      serviceLatitudeInput,
      serviceLongitudeInput,
    });
    setError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const latStr = serviceLatitudeInput.trim();
    const lngStr = serviceLongitudeInput.trim();
    let serviceLatitude: number | null = null;
    let serviceLongitude: number | null = null;
    if (latStr !== "" || lngStr !== "") {
      if (latStr === "" || lngStr === "") {
        setError("Enter both latitude and longitude for the map pin, or leave both fields empty.");
        return;
      }
      const la = Number(latStr);
      const lo = Number(lngStr);
      if (!Number.isFinite(la) || !Number.isFinite(lo)) {
        setError("Latitude and longitude must be valid numbers.");
        return;
      }
      if (la < -90 || la > 90 || lo < -180 || lo > 180) {
        setError("Coordinates are out of range.");
        return;
      }
      serviceLatitude = la;
      serviceLongitude = lo;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/repairers/${encodeURIComponent(initial.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName,
          bio,
          serviceDescription,
          expertise: expertiseText,
          servicePhotoUrl: servicePhotoUrl.trim() === "" ? null : servicePhotoUrl.trim(),
          serviceLocationLabel: serviceLocationLabel.trim(),
          serviceLatitude,
          serviceLongitude,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        serviceName?: string;
        bio?: string;
        serviceDescription?: string;
        expertise?: string[];
        completedJobsCount?: number;
        ratingSum?: number;
        ratingCount?: number;
        servicePhotoUrl?: string | null;
        serviceLocationLabel?: string;
        serviceLatitude?: number | null;
        serviceLongitude?: number | null;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not save changes.");
        return;
      }
      if (typeof data.serviceName === "string") setServiceName(data.serviceName);
      if (typeof data.bio === "string") setBio(data.bio);
      if (typeof data.serviceDescription === "string") setServiceDescription(data.serviceDescription);
      if (Array.isArray(data.expertise)) setExpertiseText(data.expertise.join(", "));
      if (typeof data.completedJobsCount === "number") {
        setStats((s) => ({ ...s, completedJobsCount: data.completedJobsCount! }));
      }
      if (typeof data.ratingSum === "number" && typeof data.ratingCount === "number") {
        setStats((s) => ({ ...s, ratingSum: data.ratingSum!, ratingCount: data.ratingCount! }));
      }
      if (data.servicePhotoUrl !== undefined) {
        setServicePhotoUrl(data.servicePhotoUrl ?? "");
        setPhotoBroken(false);
      }
      if (typeof data.serviceLocationLabel === "string") setServiceLocationLabel(data.serviceLocationLabel);
      if (data.serviceLatitude !== undefined) {
        setServiceLatitudeInput(data.serviceLatitude != null ? String(data.serviceLatitude) : "");
      }
      if (data.serviceLongitude !== undefined) {
        setServiceLongitudeInput(data.serviceLongitude != null ? String(data.serviceLongitude) : "");
      }
      setSnapshot(null);
      setEditing(false);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (snapshot) {
      setBio(snapshot.bio);
      setServiceName(snapshot.serviceName);
      setServiceDescription(snapshot.serviceDescription);
      setExpertiseText(snapshot.expertiseText);
      setServicePhotoUrl(snapshot.servicePhotoUrl);
      setServiceLocationLabel(snapshot.serviceLocationLabel);
      setServiceLatitudeInput(snapshot.serviceLatitudeInput);
      setServiceLongitudeInput(snapshot.serviceLongitudeInput);
      setPhotoBroken(false);
    }
    setSnapshot(null);
    setError(null);
    setEditing(false);
  }

  async function uploadServicePhoto(file: File | null) {
    if (!file) return;
    setError(null);
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setServicePhotoUrl(data.url);
      setPhotoBroken(false);
    } catch {
      setError("Upload failed.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  return (
    <div className={styles.layout}>
      <div className={styles.mainColumn}>
        <header className={styles.head}>
          <div className={styles.headRow}>
            <div>
              <h1 className={styles.title}>{serviceName || initial.displayName}</h1>
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
            <span className={styles.statValue}>{jobsListed}</span>
            <span className={styles.statLabel}>Completed jobs listed</span>
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
              <label className={styles.label} htmlFor="serviceName">
                Service name
              </label>
              <input
                id="serviceName"
                className={styles.input}
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Your repair service name"
                disabled={saving}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="servicePhotoUpload">
                Service photo
              </label>
              <input
                id="servicePhotoUpload"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className={styles.fileInput}
                disabled={saving || uploadingPhoto}
                onChange={(e) => {
                  void uploadServicePhoto(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
              {servicePhotoUrl ? (
                <button
                  type="button"
                  className={styles.removePhotoBtn}
                  onClick={() => setServicePhotoUrl("")}
                  disabled={saving || uploadingPhoto}
                >
                  Remove photo
                </button>
              ) : null}
              <p className={styles.fieldHint}>
                {uploadingPhoto
                  ? "Uploading service photo..."
                  : "Upload an image file (jpg, png, webp, gif)."}
              </p>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="serviceLocationLabel">
                Location label
              </label>
              <input
                id="serviceLocationLabel"
                className={styles.input}
                value={serviceLocationLabel}
                onChange={(e) => setServiceLocationLabel(e.target.value)}
                placeholder="e.g. Helsinki — workshop name"
                disabled={saving}
              />
            </div>
            <div className={styles.coordRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="serviceLatitude">
                  Map latitude (WGS84)
                </label>
                <input
                  id="serviceLatitude"
                  className={styles.input}
                  value={serviceLatitudeInput}
                  onChange={(e) => setServiceLatitudeInput(e.target.value)}
                  placeholder={String(DEFAULT_SERVICE_MAP.latitude)}
                  disabled={saving}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="serviceLongitude">
                  Map longitude (WGS84)
                </label>
                <input
                  id="serviceLongitude"
                  className={styles.input}
                  value={serviceLongitudeInput}
                  onChange={(e) => setServiceLongitudeInput(e.target.value)}
                  placeholder={String(DEFAULT_SERVICE_MAP.longitude)}
                  disabled={saving}
                />
              </div>
            </div>
            <p className={styles.fieldHint}>
              Leave latitude and longitude empty to show a default Helsinki overview. Set both to drop a pin on the
              embedded map.
            </p>
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

            <section className={styles.card} aria-label="Completed repair jobs">
              <h2 className={styles.sectionTitle}>Completed jobs</h2>
              {completedJobs.length === 0 ? (
                <p className={styles.muted}>
                  {isOwner
                    ? "Finished jobs you complete on FIKS will appear here for customers to review."
                    : "No completed jobs to show yet."}
                </p>
              ) : (
                <ul className={styles.jobList}>
                  {completedJobs.map((job) => (
                    <li key={job.id}>
                      <details className={styles.jobDetails}>
                        <summary className={styles.jobSummary}>
                          <span className={styles.jobSummaryText}>
                            <span className={styles.jobTitle}>{job.title}</span>
                            <span className={styles.jobMeta}>
                              {formatJobDate(job.completedAt)}
                              {job.ratingStars != null ? ` · ${job.ratingStars}/5` : ""}
                            </span>
                          </span>
                          <span className={styles.jobChevron} aria-hidden />
                        </summary>
                        <div className={styles.jobBody}>
                          {job.itemSummary ? (
                            <p className={styles.jobLead}>{job.itemSummary}</p>
                          ) : null}
                          <div className={styles.jobBlock}>
                            <h3 className={styles.jobBlockTitle}>Agreement</h3>
                            {job.agreementSummary ? (
                              <p className={styles.jobBlockText}>{job.agreementSummary}</p>
                            ) : (
                              <p className={styles.muted}>No agreement summary stored for this job.</p>
                            )}
                          </div>
                          <div className={styles.jobBlock}>
                            <h3 className={styles.jobBlockTitle}>Messaging</h3>
                            {job.messagesSummary ? (
                              <p className={styles.jobBlockText}>{job.messagesSummary}</p>
                            ) : (
                              <p className={styles.muted}>No message summary stored for this job.</p>
                            )}
                          </div>
                          <div className={styles.jobBlock}>
                            <h3 className={styles.jobBlockTitle}>Repair story</h3>
                            {job.repairStoryNotes.trim() ? (
                              <p className={styles.jobBlockText}>{job.repairStoryNotes}</p>
                            ) : (
                              <p className={styles.muted}>
                                Repair story view is not available yet — this job will show photos, steps, and outcomes
                                here later.
                              </p>
                            )}
                          </div>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>

      <aside className={styles.sidebar} aria-label="Service location and photo">
        <div className={styles.sidebarCard}>
          <h2 className={styles.sidebarTitle}>Service photo</h2>
          <div className={styles.photoFrame}>
            {photoSrc && !photoBroken ? (
              <img
                src={photoSrc}
                alt=""
                className={styles.photoImg}
                onError={() => setPhotoBroken(true)}
              />
            ) : (
              <div className={styles.photoPlaceholder} aria-hidden>
                <span className={styles.photoPlaceholderText}>
                  {isOwner && editing ? "Add an image URL in the form" : "No photo yet"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.sidebarCard}>
          <h2 className={styles.sidebarTitle}>Service location</h2>
          <div className={styles.mapWrap}>
            <iframe title="Service location map" className={styles.mapFrame} src={mapSrc} loading="lazy" />
          </div>
          <p className={styles.mapCaption}>{displayLocationLabel}</p>
          {!hasSavedPin && !previewCoordsValid ? (
            <p className={styles.mapHint}>Default map — add coordinates in your profile to pin your workshop.</p>
          ) : null}
          <a className={styles.mapLink} href={osmLink} target="_blank" rel="noreferrer">
            Open in OpenStreetMap
          </a>
        </div>
      </aside>

      {!isOwner && !avg && jobsListed === 0 ? (
        <p className={`${styles.note} ${styles.noteFull}`}>
          This repairer has not completed rated jobs on FIKS yet.
        </p>
      ) : null}
    </div>
  );
}
