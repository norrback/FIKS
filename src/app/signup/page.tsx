"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"user" | "repairer">("user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    serviceName: "",
    services: "",
    bio: "",
    postalCode: "",
  });
  const [locationName, setLocationName] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const geocodePostalCode = useCallback(async (code: string) => {
    if (code.trim().length < 3) {
      setLocationName(null);
      setCoords(null);
      return;
    }
    setGeocoding(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(code.trim())}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        lat: number | null;
        lng: number | null;
        locationName: string | null;
      };
      if (data.lat != null && data.lng != null) {
        setCoords({ lat: data.lat, lng: data.lng });
        setLocationName(data.locationName || null);
      } else {
        setLocationName(null);
        setCoords(null);
      }
    } catch {
      /* silently ignore */
    } finally {
      setGeocoding(false);
    }
  }, []);

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, postalCode: value }));
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(() => geocodePostalCode(value), 800);
  };

  useEffect(() => {
    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          ...(role === "repairer"
            ? {
                serviceName: formData.serviceName,
                services: formData.services,
                bio: formData.bio,
                postalCode: formData.postalCode.trim(),
                locationName: locationName || "",
                latitude: coords?.lat ?? null,
                longitude: coords?.lng ?? null,
              }
            : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        detail?: string;
        repairerSlug?: string;
      };
      if (!res.ok) {
        const base = data.error ?? "Could not create account. Try again.";
        setError(data.detail ? `${base}\n${data.detail}` : base);
        return;
      }
      if (data.repairerSlug) {
        router.push(`/repairers/${data.repairerSlug}`);
      } else {
        router.push("/listings");
      }
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>
          {role === "user"
            ? "Sign up to list your broken items."
            : "Sign up to offer your repair services and help others."}
        </p>
        
        <div className={styles.roleToggle}>
          <button 
            className={`${styles.roleBtn} ${role === "user" ? styles.active : ""}`}
            onClick={() => setRole("user")}
            type="button"
          >
            I need repairs
          </button>
          <button 
            className={`${styles.roleBtn} ${role === "repairer" ? styles.active : ""}`}
            onClick={() => setRole("repairer")}
            type="button"
          >
            I am a repairer
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className={styles.input}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              autoComplete="name"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>

          {role === "repairer" && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="serviceName" className={styles.label}>Repair Service Name</label>
                <input
                  id="serviceName"
                  name="serviceName"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Nordic Fix Lab"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  required={role === "repairer"}
                  disabled={loading}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="services" className={styles.label}>Services Offered</label>
                <input
                  id="services"
                  name="services"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Electronics, Bicycles, Furniture"
                  value={formData.services}
                  onChange={handleInputChange}
                  required={role === "repairer"}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bio" className={styles.label}>Short Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder="Tell us a bit about your experience and what you like to repair..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  required={role === "repairer"}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="postalCode" className={styles.label}>Postal Code</label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. 66850"
                  value={formData.postalCode}
                  onChange={handlePostalCodeChange}
                  disabled={loading}
                />
                {geocoding && <small className={styles.hint}>Looking up location…</small>}
                {!geocoding && locationName && (
                  <small className={styles.hint}>{locationName}</small>
                )}
              </div>
            </>
          )}
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
