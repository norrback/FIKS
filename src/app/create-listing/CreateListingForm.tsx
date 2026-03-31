"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LISTING_CATEGORY_TREE, type MainListingCategory } from "@/lib/listingCategories";
import styles from "./create-listing.module.css";

export default function CreateListingForm() {
  const router = useRouter();
  const mainCategories = Object.keys(LISTING_CATEGORY_TREE) as MainListingCategory[];
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    location: "",
    mainCategory: mainCategories[0] ?? "ELECTRONICS",
    subCategory: LISTING_CATEGORY_TREE.ELECTRONICS[0] ?? "",
    photoUrls: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mainCategory = e.target.value as MainListingCategory;
    const firstSub = LISTING_CATEGORY_TREE[mainCategory]?.[0] ?? "";
    setFormData((prev) => ({ ...prev, mainCategory, subCategory: firstSub }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: fd });
        const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Upload failed.");
        }
        uploadedUrls.push(data.url);
      }
      setFormData((prev) => ({
        ...prev,
        photoUrls: [...prev.photoUrls, ...uploadedUrls],
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setError(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
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
          mainCategory: formData.mainCategory,
          subCategory: formData.subCategory,
          photoUrls: formData.photoUrls,
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
            <label htmlFor="mainCategory" className={styles.label}>
              Main Category
            </label>
            <select
              id="mainCategory"
              name="mainCategory"
              className={styles.input}
              value={formData.mainCategory}
              onChange={handleMainCategoryChange}
              required
              disabled={loading}
            >
              {mainCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="subCategory" className={styles.label}>
              Subcategory
            </label>
            <select
              id="subCategory"
              name="subCategory"
              className={styles.input}
              value={formData.subCategory}
              onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
              required
              disabled={loading}
            >
              {(LISTING_CATEGORY_TREE[formData.mainCategory as MainListingCategory] ?? []).map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="photoUpload" className={styles.label}>
              Photos
            </label>
            <input
              id="photoUpload"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              multiple
              className={styles.fileInput}
              onChange={handlePhotoUpload}
              disabled={loading || uploading}
            />
            <small className={styles.uploadHint}>
              {uploading ? "Uploading photos..." : "Upload image files (jpg, png, webp, gif)."}
            </small>
            {formData.photoUrls.length > 0 ? (
              <div className={styles.uploadPreviewRow}>
                {formData.photoUrls.map((url, idx) => (
                  <img key={`upload-preview-${idx}`} src={url} alt="" className={styles.uploadPreviewImg} />
                ))}
              </div>
            ) : null}
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

          <button type="submit" className={styles.submitBtn} disabled={loading || uploading}>
            {loading ? "Publishing…" : uploading ? "Uploading photos…" : "Publish Listing"}
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
