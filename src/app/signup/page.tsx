"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./signup.module.css";

export default function SignupPage() {
  const [role, setRole] = useState<"user" | "repairer">("user");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    services: "",
    bio: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Signup as ${role}:`, formData);
    alert(`Signed up successfully as ${role}!`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>
          {role === "user" 
            ? "Sign up to list your broken items and find repairers." 
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
              required
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
              required
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
              required
            />
          </div>

          {role === "repairer" && (
            <>
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
                />
              </div>
            </>
          )}
          
          <button type="submit" className={styles.submitBtn}>
            Create Account
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
