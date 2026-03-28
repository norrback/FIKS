"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Temporary mock for login action
    console.log("Login attempted with:", email, password);
    alert("Login mockup submitted! Redirecting...");
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to manage your repairs or listings.</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className={styles.submitBtn}>
            Log In
          </button>
        </form>

        <p className={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
