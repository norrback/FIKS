"use client";

import { useState } from "react";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h1 className={styles.title}>Get in touch</h1>
          <p className={styles.subtitle}>
            Have a question, feedback, or just want to say hello? We&apos;d love
            to hear from you.
          </p>
          <p className={styles.emailRow}>
            Or reach us directly at{" "}
            <a href="mailto:hello@fiks.fi" className={styles.emailLink}>
              hello@fiks.fi
            </a>
          </p>
        </header>

        <div className={styles.formCard}>
          {submitted ? (
            <div className={styles.thanks}>
              <div className={styles.thanksIcon} aria-hidden="true">&#10003;</div>
              <h2 className={styles.thanksTitle}>Message received</h2>
              <p className={styles.thanksBody}>
                Thanks for reaching out. We&apos;ll get back to you at the email
                address you provided, usually within one business day.
              </p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={styles.input}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="message" className={styles.label}>
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className={styles.textarea}
                  placeholder="How can we help?"
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                Send message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
