import type { Metadata } from "next";
import styles from "../privacy/privacy.module.css";

export const metadata: Metadata = {
  title: "Terms of Service — FIKS",
  description:
    "FIKS terms of service. Read the rules and conditions for using the FIKS repair marketplace.",
};

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.updated}>Last updated: 11 April 2026</p>
        <p className={styles.intro}>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the FIKS
          platform (&ldquo;Service&rdquo;), operated by FIKS (Finland). By creating an
          account or using the Service, you agree to these Terms. Please read
          them carefully.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. The Service</h2>
        <p className={styles.body}>
          FIKS is an online marketplace that connects people who have broken
          items (&ldquo;Customers&rdquo;) with skilled repair professionals
          (&ldquo;Repairers&rdquo;). FIKS provides the platform only — we are not a party
          to any repair agreement made between Customers and Repairers, and we
          do not perform repairs ourselves.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Eligibility</h2>
        <p className={styles.body}>
          You must be at least 18 years old to use the Service. By registering,
          you confirm that the information you provide is accurate and that you
          have the legal capacity to enter into a binding agreement.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Accounts</h2>
        <p className={styles.body}>
          You are responsible for keeping your login credentials confidential
          and for all activity that occurs under your account. Notify us
          immediately at{" "}
          <a href="mailto:hello@fiks.fi" className={styles.contactEmail}>
            hello@fiks.fi
          </a>{" "}
          if you suspect unauthorised access to your account.
        </p>
        <p className={styles.body}>
          We reserve the right to suspend or terminate accounts that violate
          these Terms or that are used for fraudulent or harmful purposes.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Listings and content</h2>
        <p className={styles.body}>
          When you post a listing or any content on FIKS, you confirm that:
        </p>
        <ul className={styles.list}>
          <li>The content is accurate and not misleading.</li>
          <li>You own or have the right to share the content.</li>
          <li>
            The content does not infringe any third-party intellectual property
            rights.
          </li>
          <li>
            The content does not contain illegal, offensive, or harmful
            material.
          </li>
        </ul>
        <p className={styles.body}>
          You retain ownership of the content you post. By posting, you grant
          FIKS a non-exclusive, royalty-free licence to display and distribute
          the content within the platform for the purpose of operating the
          Service.
        </p>
        <p className={styles.body}>
          We reserve the right to remove any content that violates these Terms
          without prior notice.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Repairer responsibilities</h2>
        <p className={styles.body}>
          Repairers are independent service providers and not employees or
          agents of FIKS. Repairers are solely responsible for the quality,
          safety, and legality of the services they offer. Repairers must
          comply with all applicable Finnish and EU laws, including consumer
          protection regulations, when providing services to Customers.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Customer responsibilities</h2>
        <p className={styles.body}>
          Customers are responsible for providing accurate descriptions of
          items to be repaired and for communicating clearly with Repairers.
          Customers must honour agreed terms with Repairers and pay any agreed
          fees promptly.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>7. Prohibited conduct</h2>
        <p className={styles.body}>You may not use FIKS to:</p>
        <ul className={styles.list}>
          <li>Post false, misleading, or fraudulent listings or profiles.</li>
          <li>Harass, threaten, or abuse other users.</li>
          <li>
            Circumvent the platform by arranging transactions outside FIKS in
            order to avoid any future platform fees.
          </li>
          <li>
            Use automated tools (bots, scrapers) to access the Service without
            our written permission.
          </li>
          <li>
            Attempt to gain unauthorised access to other accounts or platform
            systems.
          </li>
          <li>
            Violate any applicable local, national, or international law or
            regulation.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>8. Limitation of liability</h2>
        <p className={styles.body}>
          To the fullest extent permitted by Finnish law, FIKS is not liable
          for any indirect, incidental, or consequential damages arising from
          your use of the Service, including but not limited to disputes between
          Customers and Repairers, loss of data, or damage to items.
        </p>
        <p className={styles.body}>
          FIKS does not guarantee the quality, safety, or outcome of any repair
          arranged through the platform.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>9. Intellectual property</h2>
        <p className={styles.body}>
          All platform software, design, trademarks, and content produced by
          FIKS are the property of FIKS and may not be copied, modified, or
          distributed without our written consent.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>10. Termination</h2>
        <p className={styles.body}>
          You may delete your account at any time. We may suspend or terminate
          your access if you breach these Terms. Upon termination, your right
          to use the Service ceases immediately. Provisions that by their nature
          survive termination (such as limitations of liability) will continue
          to apply.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>11. Changes to these Terms</h2>
        <p className={styles.body}>
          We may update these Terms from time to time. We will notify you of
          material changes by email or by a prominent notice on the platform.
          Continued use of the Service after the effective date of the revised
          Terms constitutes your acceptance of the changes.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>12. Governing law</h2>
        <p className={styles.body}>
          These Terms are governed by the laws of Finland. Any disputes arising
          from these Terms or the use of the Service shall be subject to the
          jurisdiction of the Finnish courts. As a consumer, you may also
          contact the Finnish Consumer Disputes Board (Kuluttajariitalautakunta)
          for out-of-court dispute resolution.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>13. Contact</h2>
        <p className={styles.body}>
          For questions about these Terms, please contact us:
        </p>
        <div className={styles.contactBox}>
          <p className={styles.contactLabel}>General enquiries</p>
          <a href="mailto:hello@fiks.fi" className={styles.contactEmail}>
            hello@fiks.fi
          </a>
        </div>
      </section>
    </div>
  );
}
