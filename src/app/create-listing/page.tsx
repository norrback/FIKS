"use client";

import React, { useState } from "react";
import styles from "./create-listing.module.css";

export default function CreateListingPage() {
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    location: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Listing created:", formData);
    alert("Your broken item has been listed successfully!");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>List your broken item</h1>
        <p className={styles.subtitle}>Help repairers find you and bring your item back to life.</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.layout}>
        {/* Left side: Form Inputs */}
        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label htmlFor="itemName" className={styles.label}>Item Name</label>
            <input
              id="itemName"
              name="itemName"
              type="text"
              className={styles.input}
              placeholder="e.g. Sony Headphones WH-1000XM4"
              value={formData.itemName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Description of Issue</label>
            <textarea
              id="description"
              name="description"
              className={`${styles.input} ${styles.textarea}`}
              placeholder="What seems to be broken? E.g. The right ear cup has no sound when moving the cable."
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.label}>Location / Neighborhood</label>
            <input
              id="location"
              name="location"
              type="text"
              className={styles.input}
              placeholder="e.g. Kallio, Helsinki"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <button type="submit" className={styles.submitBtn}>
            Publish Listing
          </button>
        </div>

        {/* Right side: Map representation */}
        <div className={styles.mapSection}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Approximate Location</label>
            <div className={styles.mapContainer}>
              {/* Simple embedded OSM iframe centered on Helsinki for the mockup */}
              <iframe
                title="Location Map"
                className={styles.map}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=24.91%2C60.15%2C24.96%2C60.20&layer=mapnik&marker=60.17%2C24.93`}
                allowFullScreen
              ></iframe>
            </div>
            {formData.location && (
              <small style={{ color: '#666', marginTop: '0.5rem' }}>
                Map will be centered on <strong>{formData.location}</strong>
              </small>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
