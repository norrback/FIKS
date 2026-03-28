"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./create-listing.module.css";

export default function CreateListingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    location: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          title: formData.itemName.trim(),
          description: formData.description.trim(),
          location: formData.location.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?next=" + encodeURIComponent("/create-listing"));
          return;
        }
        const base = data.error ?? "Could not publish listing. Try again.";
        setError(data.detail ? `${base}\n${data.detail}` : base);
        return;
      }
      if (!data.id) {
        setError("Listing was saved but no id was returned.");
        return;
      }
      router.push(`/listings/${data.id}`);
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>List your broken item</h1>
        <p className={styles.subtitle}>Help repairers find you and bring your item back to life.</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.layout}>
        <div className={styles.formSection}>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <div className={styles.formGroup}>
            <label htmlFor="itemName" className={styles.label}>
              Item Name
            </label>
            <input
              id="itemName"
              name="itemName"
              type="text"
              className={styles.input}
              placeholder="e.g. Sony Headphones WH-1000XM4"
              value={formData.itemName}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description of Issue
            </label>
            <textarea
              id="description"
              name="description"
              className={`${styles.input} ${styles.textarea}`}
              placeholder="What seems to be broken? E.g. The right ear cup has no sound when moving the cable."
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.label}>
              Location / Neighborhood
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className={styles.input}
              placeholder="e.g. Kallio, Helsinki"
              value={formData.location}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Publishing…" : "Publish Listing"}
          </button>
        </div>

        <div className={styles.mapSection}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Approximate Location</label>
            <div className={styles.mapContainer}>
              <iframe
                title="Location Map"
                className={styles.map}
                src="https://www.openstreetmap.org/export/embed.html?bbox=24.91%2C60.15%2C24.96%2C60.20&layer=mapnik&marker=60.17%2C24.93"
                allowFullScreen
              />
            </div>
            {formData.location ? (
              <small style={{ color: "#666", marginTop: "0.5rem" }}>
                Map will be centered on <strong>{formData.location}</strong>
              </small>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
