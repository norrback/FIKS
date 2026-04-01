"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LISTING_CATEGORY_TREE, type MainListingCategory } from "@/lib/listingCategories";
import { parsePhotoUrls } from "@/lib/listingPhotos";
import styles from "./my-items.module.css";

export type MyItem = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  mainCategory: string;
  subCategory: string;
  photoUrlsJson: string;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  initialItems: MyItem[];
};

type EditState = {
  title: string;
  description: string;
  location: string;
  mainCategory: string;
  subCategory: string;
  photoUrls: string[];
};

function toEditState(item: MyItem): EditState {
  return {
    title: item.title,
    description: item.description,
    location: item.location ?? "",
    mainCategory: item.mainCategory || "ELECTRONICS",
    subCategory: item.subCategory || "",
    photoUrls: parsePhotoUrls(item.photoUrlsJson),
  };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function MyItemsClient({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => Object.keys(LISTING_CATEGORY_TREE) as MainListingCategory[], []);

  useEffect(() => {
    if (!openMenuId) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      const host = menuRefs.current[openMenuId];
      if (host && target && !host.contains(target)) {
        setOpenMenuId(null);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenuId]);

  function beginEdit(item: MyItem) {
    setEditingId(item.id);
    setEditState(toEditState(item));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditState(null);
    setError(null);
  }

  async function saveItem(id: string) {
    if (!editState) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editState.title,
          description: editState.description,
          location: editState.location,
          mainCategory: editState.mainCategory,
          subCategory: editState.subCategory,
          photoUrls: editState.photoUrls,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
        title?: string;
        description?: string;
        location?: string | null;
        status?: string;
        mainCategory?: string;
        subCategory?: string;
        photoUrlsJson?: string;
        updatedAt?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not save item.");
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                title: data.title ?? item.title,
                description: data.description ?? item.description,
                location: data.location ?? item.location,
                status: data.status ?? item.status,
                mainCategory: data.mainCategory ?? item.mainCategory,
                subCategory: data.subCategory ?? item.subCategory,
                photoUrlsJson: data.photoUrlsJson ?? item.photoUrlsJson,
                updatedAt: data.updatedAt ?? item.updatedAt,
              }
            : item,
        ),
      );
      cancelEdit();
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(item: MyItem) {
    setError(null);
    const nextStatus = item.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      const res = await fetch(`/api/listings/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; status?: string; updatedAt?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not update status.");
        return;
      }
      setItems((prev) =>
        prev.map((x) =>
          x.id === item.id ? { ...x, status: data.status ?? nextStatus, updatedAt: data.updatedAt ?? x.updatedAt } : x,
        ),
      );
    } catch {
      setError("Network error while updating status.");
    }
  }

  async function uploadPhotosForItem(itemId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    if (editingId !== itemId || !editState) return;
    setError(null);
    setUploadingForId(itemId);
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
      setEditState((s) => (s ? { ...s, photoUrls: [...s.photoUrls, ...uploadedUrls] } : s));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setError(msg);
    } finally {
      setUploadingForId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>You have not listed any items yet.</p>
        <Link href="/create-listing" className={styles.primaryLink}>
          Create your first listing
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {error ? <p className={styles.error}>{error}</p> : null}
      {items.map((item) => {
        const photos = parsePhotoUrls(item.photoUrlsJson);
        const isEditing = editingId === item.id && editState;
        const subcategories = LISTING_CATEGORY_TREE[(editState?.mainCategory as MainListingCategory) ?? "ELECTRONICS"] ?? [];

        return (
          <article key={item.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <h2 className={styles.cardTitle}>{item.title}</h2>
                <p className={styles.cardMeta}>
                  {item.location ?? "Location not set"} · {item.mainCategory}
                  {item.subCategory ? ` / ${item.subCategory}` : ""} · {item.status.replace(/_/g, " ")}
                </p>
                <p className={styles.cardMetaSmall}>Updated {formatDate(item.updatedAt)}</p>
              </div>

              <div
                className={styles.menu}
                ref={(el) => {
                  menuRefs.current[item.id] = el;
                }}
              >
                <button
                  type="button"
                  className={styles.menuButton}
                  aria-label="Manage item"
                  aria-expanded={openMenuId === item.id}
                  onClick={() => setOpenMenuId((v) => (v === item.id ? null : item.id))}
                >
                  ...
                </button>
                {openMenuId === item.id ? (
                  <div className={styles.menuContent}>
                    <button
                      type="button"
                      className={styles.menuAction}
                      onClick={() => {
                        beginEdit(item);
                        setOpenMenuId(null);
                      }}
                    >
                      Edit listing
                    </button>
                    <button
                      type="button"
                      className={styles.menuAction}
                      onClick={() => {
                        beginEdit(item);
                        setOpenMenuId(null);
                      }}
                    >
                      Add pictures
                    </button>
                    <button
                      type="button"
                      className={styles.menuAction}
                      onClick={() => {
                        void toggleStatus(item);
                        setOpenMenuId(null);
                      }}
                    >
                      {item.status === "OPEN" ? "Mark as closed" : "Re-open item"}
                    </button>
                    <Link
                      href={`/listings/${item.id}`}
                      className={styles.menuActionLink}
                      onClick={() => setOpenMenuId(null)}
                    >
                      Open listing
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>

            {!isEditing ? (
              <>
                <p className={styles.description}>{item.description}</p>
                {photos.length > 0 ? (
                  <div className={styles.photoRow}>
                    {photos.slice(0, 4).map((url, idx) => (
                      <img key={`${item.id}-thumb-${idx}`} src={url} alt="" className={styles.thumb} loading="lazy" />
                    ))}
                    {photos.length > 4 ? <span className={styles.moreCount}>+{photos.length - 4}</span> : null}
                  </div>
                ) : (
                  <p className={styles.noPhotos}>No pictures yet.</p>
                )}
              </>
            ) : (
              <form
                className={styles.editForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  void saveItem(item.id);
                }}
              >
                <label className={styles.label} htmlFor={`title-${item.id}`}>
                  Item name
                </label>
                <input
                  id={`title-${item.id}`}
                  className={styles.input}
                  value={editState.title}
                  onChange={(e) => setEditState((s) => (s ? { ...s, title: e.target.value } : s))}
                  disabled={saving}
                  required
                />

                <label className={styles.label} htmlFor={`desc-${item.id}`}>
                  Issue description
                </label>
                <textarea
                  id={`desc-${item.id}`}
                  className={styles.textarea}
                  value={editState.description}
                  onChange={(e) => setEditState((s) => (s ? { ...s, description: e.target.value } : s))}
                  disabled={saving}
                  required
                />

                <label className={styles.label} htmlFor={`loc-${item.id}`}>
                  Location
                </label>
                <input
                  id={`loc-${item.id}`}
                  className={styles.input}
                  value={editState.location}
                  onChange={(e) => setEditState((s) => (s ? { ...s, location: e.target.value } : s))}
                  disabled={saving}
                />

                <div className={styles.row2}>
                  <div>
                    <label className={styles.label} htmlFor={`main-${item.id}`}>
                      Main category
                    </label>
                    <select
                      id={`main-${item.id}`}
                      className={styles.input}
                      value={editState.mainCategory}
                      onChange={(e) => {
                        const mainCategory = e.target.value;
                        const firstSub =
                          LISTING_CATEGORY_TREE[mainCategory as MainListingCategory]?.[0] ?? "";
                        setEditState((s) => (s ? { ...s, mainCategory, subCategory: firstSub } : s));
                      }}
                      disabled={saving}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={styles.label} htmlFor={`sub-${item.id}`}>
                      Subcategory
                    </label>
                    <select
                      id={`sub-${item.id}`}
                      className={styles.input}
                      value={editState.subCategory}
                      onChange={(e) => setEditState((s) => (s ? { ...s, subCategory: e.target.value } : s))}
                      disabled={saving}
                    >
                      {subcategories.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className={styles.label} htmlFor={`photos-upload-${item.id}`}>
                  Pictures
                </label>
                <input
                  id={`photos-upload-${item.id}`}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  className={styles.fileInput}
                  disabled={saving || uploadingForId === item.id}
                  onChange={(e) => {
                    void uploadPhotosForItem(item.id, e.target.files);
                    e.target.value = "";
                  }}
                />
                <small className={styles.uploadHint}>
                  {uploadingForId === item.id ? "Uploading photos..." : "Upload image files directly."}
                </small>
                {editState.photoUrls.length > 0 ? (
                  <div className={styles.photoRow}>
                    {editState.photoUrls.map((url, idx) => (
                      <img key={`${item.id}-edit-thumb-${idx}`} src={url} alt="" className={styles.thumb} loading="lazy" />
                    ))}
                  </div>
                ) : null}

                <div className={styles.actions}>
                  <button type="button" className={styles.secondaryBtn} onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryBtn} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </article>
        );
      })}
    </div>
  );
}
