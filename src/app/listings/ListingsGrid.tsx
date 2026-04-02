"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./listings.module.css";

export type ListingGridItem = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  postalCode: string;
  locationName: string;
  status: string;
  mainCategory: string;
  subCategory: string;
  authorName: string;
  photoUrls: string[];
  createdAt: string;
};

type SortKey = "default" | "oldest" | "nearest";

type Coords = { lat: number; lng: number };

const geocodeCache = new Map<string, Coords | null>();

async function geocodeLocation(text: string): Promise<Coords | null> {
  const cached = geocodeCache.get(text);
  if (cached !== undefined) return cached;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(text)}`,
      { headers: { "User-Agent": "FIKS-app/0.1" } },
    );
    const data = (await res.json()) as { lat?: string; lon?: string }[];
    if (data[0]?.lat && data[0]?.lon) {
      const coords: Coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache.set(text, coords);
      return coords;
    }
  } catch { /* ignore */ }
  geocodeCache.set(text, null);
  return null;
}

function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

type Props = {
  listings: ListingGridItem[];
};

function dotLabel(index: number): string {
  return `Show photo ${index + 1}`;
}

export default function ListingsGrid({ listings }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [distances, setDistances] = useState<Map<string, number>>(new Map());
  const geocodingRef = useRef(false);

  const requestUserLocation = useCallback(() => {
    if (userCoords) return;
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoError(null);
      },
      () => {
        setGeoError("Could not access your location.");
      },
    );
  }, [userCoords]);

  useEffect(() => {
    if (sortKey !== "nearest" || !userCoords || geocodingRef.current) return;
    geocodingRef.current = true;

    const uniqueLocations = [...new Set(listings.map((l) => l.location).filter(Boolean))] as string[];
    Promise.all(uniqueLocations.map((loc) => geocodeLocation(loc).then((c) => [loc, c] as const))).then(
      (results) => {
        const coordsMap = new Map<string, Coords>();
        for (const [loc, c] of results) {
          if (c) coordsMap.set(loc, c);
        }
        const distMap = new Map<string, number>();
        for (const listing of listings) {
          if (listing.location && coordsMap.has(listing.location)) {
            distMap.set(listing.id, haversineKm(userCoords, coordsMap.get(listing.location)!));
          } else {
            distMap.set(listing.id, Infinity);
          }
        }
        setDistances(distMap);
        geocodingRef.current = false;
      },
    );
  }, [sortKey, userCoords, listings]);

  function handleSortChange(key: SortKey) {
    setSortKey(key);
    if (key === "nearest") {
      requestUserLocation();
    }
  }

  const sorted = useMemo(() => {
    switch (sortKey) {
      case "oldest":
        return [...listings].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      case "nearest": {
        if (distances.size === 0) return listings;
        return [...listings].sort(
          (a, b) => (distances.get(a.id) ?? Infinity) - (distances.get(b.id) ?? Infinity),
        );
      }
      default:
        return listings;
    }
  }, [listings, sortKey, distances]);

  return (
    <>
      <div className={styles.sortRow}>
        <label htmlFor="listing-sort" className={styles.sortLabel}>
          Sort by
        </label>
        <select
          id="listing-sort"
          className={styles.sortSelect}
          value={sortKey}
          onChange={(e) => handleSortChange(e.target.value as SortKey)}
        >
          <option value="default">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="nearest">Nearest to me</option>
        </select>
        {sortKey === "nearest" && geoError ? (
          <span className={styles.sortHint}>{geoError}</span>
        ) : null}
        {sortKey === "nearest" && !userCoords && !geoError ? (
          <span className={styles.sortHint}>Requesting location…</span>
        ) : null}
      </div>
      <ul className={styles.grid}>
        {sorted.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            distanceKm={sortKey === "nearest" ? distances.get(listing.id) : undefined}
          />
        ))}
      </ul>
    </>
  );
}

function ListingCard({ listing, distanceKm }: { listing: ListingGridItem; distanceKm?: number }) {
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
            {listing.postalCode
              ? `${listing.postalCode}${listing.locationName ? ` ${listing.locationName}` : ""}`
              : listing.location ?? "Location not set"}
            {distanceKm != null && distanceKm !== Infinity
              ? ` · ${distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${Math.round(distanceKm)} km`}`
              : ""}
            {" · "}
            {listing.authorName}
          </p>
          <span className={styles.status}>{listing.status.replace(/_/g, " ")}</span>
        </div>
      </Link>
    </li>
  );
}
