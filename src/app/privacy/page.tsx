import type { Metadata } from "next";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — FIKS",
  description:
    "FIKS privacy policy. Learn how we collect, use, and protect your personal data under GDPR.",
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: 9 April 2026</p>
        <p className={styles.intro}>
          FIKS (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates a
          repair marketplace that connects customers with local repairers in
          Finland. This policy explains what personal data we collect, why we
          collect it, how we use it, and what rights you have under the EU
          General Data Protection Regulation (GDPR).
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Data controller</h2>
        <p className={styles.body}>
          The data controller responsible for your personal data is FIKS (Finland).
          For any questions or requests relating to your data, contact us at{" "}
          <a href="mailto:hello@fiks.fi" className={styles.contactEmail}>
            hello@fiks.fi
          </a>
          .
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. What data we collect</h2>
        <p className={styles.body}>
          We collect only the data necessary to operate the platform. This
          includes:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Account data</strong> — name and email address provided
            when you register.
          </li>
          <li>
            <strong>Repair listings</strong> — title, description, photos,
            category, and location (city or postal code) that you submit when
            creating a listing.
          </li>
          <li>
            <strong>Repairer profile data</strong> — for users who register as
            repairers: location, skills, and any profile information they
            choose to add.
          </li>
          <li>
            <strong>Repair story data</strong> — messages, status updates, and
            notes exchanged between customers and repairers during a repair.
          </li>
          <li>
            <strong>Usage data</strong> — standard server logs (IP address,
            browser type, pages visited) for security and performance
            monitoring. This data is not used for advertising.
          </li>
        </ul>
        <p className={styles.body}>
          We do not collect sensitive categories of personal data (such as
          health, financial, or biometric data).
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. How we use your data</h2>
        <p className={styles.body}>
          We use your data for the following purposes:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Providing the service</strong> — creating and managing your
            account, displaying listings to repairers, and facilitating
            communication between customers and repairers.
          </li>
          <li>
            <strong>Matching</strong> — showing your repair listing to repairers
            whose skills and location are relevant.
          </li>
          <li>
            <strong>Communication</strong> — sending transactional messages
            (e.g. new application received, repair status changed). We do not
            send marketing emails without your explicit consent.
          </li>
          <li>
            <strong>Platform safety and integrity</strong> — detecting and
            preventing fraud, abuse, or misuse of the platform.
          </li>
          <li>
            <strong>Legal obligations</strong> — retaining records to the
            extent required by applicable Finnish and EU law.
          </li>
        </ul>
        <p className={styles.body}>
          The legal basis for processing is primarily the performance of a
          contract (your use of the platform) and, where applicable, our
          legitimate interests in operating a safe and functional service.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Data sharing</h2>
        <p className={styles.body}>
          We do not sell your personal data. We share data only in the following
          limited circumstances:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>With other users</strong> — your display name and listing
            details are visible to registered users of the platform as needed
            for the repair matching process.
          </li>
          <li>
            <strong>With service providers</strong> — we use third-party
            infrastructure providers (hosting, database, file storage) who
            process data on our behalf under data processing agreements and are
            bound to GDPR-compliant standards.
          </li>
          <li>
            <strong>Legal requirements</strong> — if required by law or a
            competent authority.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Data retention</h2>
        <p className={styles.body}>
          We retain your personal data for as long as your account is active or
          as needed to provide the service. If you delete your account, we will
          delete or anonymise your personal data within 30 days, except where
          retention is required by law (for example, certain transaction records
          may be retained for up to 7 years under Finnish accounting law).
        </p>
        <p className={styles.body}>
          Server log data is retained for a maximum of 90 days.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Your rights under GDPR</h2>
        <p className={styles.body}>
          As a data subject under the GDPR, you have the following rights:
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Right of access</strong> — request a copy of the personal
            data we hold about you.
          </li>
          <li>
            <strong>Right to rectification</strong> — ask us to correct
            inaccurate or incomplete data.
          </li>
          <li>
            <strong>Right to erasure</strong> (&ldquo;right to be forgotten&rdquo;) —
            request deletion of your personal data where there is no compelling
            reason for us to continue processing it.
          </li>
          <li>
            <strong>Right to data portability</strong> — receive your data in a
            structured, machine-readable format and transfer it to another
            controller.
          </li>
          <li>
            <strong>Right to restrict processing</strong> — ask us to limit how
            we use your data in certain circumstances.
          </li>
          <li>
            <strong>Right to object</strong> — object to processing based on
            legitimate interests.
          </li>
          <li>
            <strong>Right to lodge a complaint</strong> — you have the right to
            lodge a complaint with the Finnish Data Protection Ombudsman
            (Tietosuojavaltuutettu) at{" "}
            <a
              href="https://tietosuoja.fi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contactEmail}
            >
              tietosuoja.fi
            </a>
            .
          </li>
        </ul>
        <p className={styles.body}>
          To exercise any of these rights, contact us at the address below. We
          will respond within 30 days.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>7. Cookies</h2>
        <p className={styles.body}>
          We use only essential cookies necessary for the platform to function
          (for example, to keep you logged in). We do not use advertising or
          tracking cookies.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>8. Changes to this policy</h2>
        <p className={styles.body}>
          We may update this privacy policy from time to time. When we make
          material changes, we will notify you by email or by a prominent notice
          on the platform. The date at the top of this page reflects the most
          recent update.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>9. Contact us</h2>
        <p className={styles.body}>
          For any questions about this policy or to exercise your data rights,
          please contact our data protection contact:
        </p>
        <div className={styles.contactBox}>
          <p className={styles.contactLabel}>Data privacy requests</p>
          <a href="mailto:hello@fiks.fi" className={styles.contactEmail}>
            hello@fiks.fi
          </a>
        </div>
      </section>
    </div>
  );
}
