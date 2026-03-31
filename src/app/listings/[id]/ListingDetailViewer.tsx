"use client";

import { useEffect, useState } from "react";
import styles from "./listing-detail.module.css";

type Props = {
  description: string;
  photoUrls: string[];
};

export default function ListingDetailViewer({ description, photoUrls }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  function prevImage() {
    setActiveIndex((v) => (v - 1 + photoUrls.length) % photoUrls.length);
  }

  function nextImage() {
    setActiveIndex((v) => (v + 1) % photoUrls.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft" && photoUrls.length > 1) prevImage();
      if (event.key === "ArrowRight" && photoUrls.length > 1) nextImage();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, photoUrls.length]);

  const activePhoto = photoUrls[activeIndex];

  return (
    <>
      <div className={styles.detailGrid}>
        <div className={styles.leftCol}>
          <h2 className={styles.sectionLabel}>What&apos;s wrong</h2>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.rightCol}>
          <h2 className={styles.sectionLabel}>Pictures</h2>
          {activePhoto ? (
            <>
              <button
                type="button"
                className={styles.mainPhotoBtn}
                onClick={() => setLightboxOpen(true)}
                aria-label="Open full-size image viewer"
              >
                <img src={activePhoto} alt="" className={styles.mainPhoto} />
              </button>
              {photoUrls.length > 1 ? (
                <div className={styles.viewerDots}>
                  {photoUrls.map((_, idx) => (
                    <button
                      key={`viewer-dot-${idx}`}
                      type="button"
                      className={`${styles.viewerDot} ${idx === activeIndex ? styles.viewerDotActive : ""}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onFocus={() => setActiveIndex(idx)}
                      aria-label={`Show image ${idx + 1}`}
                    />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className={styles.caseNote}>No pictures added yet.</p>
          )}
        </div>
      </div>

      {lightboxOpen && activePhoto ? (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Image viewer">
          <button
            type="button"
            className={styles.lightboxBackdrop}
            aria-label="Close image viewer"
            onClick={() => setLightboxOpen(false)}
          />

          <div className={styles.lightboxContent}>
            <button type="button" className={styles.lightboxClose} onClick={() => setLightboxOpen(false)}>
              Close
            </button>

            {photoUrls.length > 1 ? (
              <button type="button" className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={prevImage}>
                ‹
              </button>
            ) : null}

            <img src={activePhoto} alt="" className={styles.lightboxImg} />

            {photoUrls.length > 1 ? (
              <button type="button" className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={nextImage}>
                ›
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
