"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./listings.module.css";

export type ListingGridItem = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  mainCategory: string;
  subCategory: string;
  authorName: string;
  photoUrls: string[];
};

type Props = {
  listings: ListingGridItem[];
};

function dotLabel(index: number): string {
  return `Show photo ${index + 1}`;
}

export default function ListingsGrid({ listings }: Props) {
  return (
    <ul className={styles.grid}>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </ul>
  );
}

function ListingCard({ listing }: { listing: ListingGridItem }) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const photos = listing.photoUrls;
  const activePhoto = useMemo(() => photos[activePhotoIndex] ?? null, [activePhotoIndex, photos]);

  return (
    <li className={styles.gridItem}>
      <Link href={`/listings/${listing.id}`} className={`${styles.card} ${styles.cardLink}`}>
        <div className={styles.photoWrap}>
          {activePhoto ? (
            <img src={activePhoto} alt="" className={styles.photo} loading="lazy" />
          ) : (
            <div className={styles.photoPlaceholder}>
              <span>{listing.mainCategory}</span>
            </div>
          )}

          {photos.length > 1 ? (
            <div className={styles.dots} onMouseLeave={() => setActivePhotoIndex(0)}>
              {photos.map((_, idx) => (
                <button
                  key={`${listing.id}-dot-${idx}`}
                  type="button"
                  className={`${styles.dot} ${idx === activePhotoIndex ? styles.dotActive : ""}`}
                  aria-label={dotLabel(idx)}
                  onMouseEnter={() => setActivePhotoIndex(idx)}
                  onFocus={() => setActivePhotoIndex(idx)}
                  onClick={(e) => e.preventDefault()}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.cardBody}>
          <p className={styles.categoryPill}>
            {listing.mainCategory}
            {listing.subCategory ? ` · ${listing.subCategory}` : ""}
          </p>
          <h2 className={styles.cardTitle}>{listing.title}</h2>
          <p className={styles.cardDesc}>{listing.description}</p>
          <p className={styles.cardMeta}>
            {listing.location ?? "Location not set"} · {listing.authorName}
          </p>
          <span className={styles.status}>{listing.status.replace(/_/g, " ")}</span>
        </div>
      </Link>
    </li>
  );
}
