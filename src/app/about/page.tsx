import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About — FIKS",
  description:
    "FIKS connects people with broken items to skilled local repairers. Learn about our mission to extend product lifetimes and reduce waste.",
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroHeadline}>
          We are{" "}
          <span className={styles.heroHeadlineAccent}>FIKS</span>
        </h1>
        <p className={styles.heroTagline}>
          A Finnish marketplace that connects people who have something broken
          with skilled local repairers who can fix it — keeping products in use
          and out of landfill.
        </p>
      </section>

      {/* Mission */}
      <section className={styles.section}>
        <p className={styles.sectionLabel}>Our mission</p>
        <h2 className={styles.sectionTitle}>Repair more. Waste less.</h2>
        <p className={styles.sectionBody}>
          Every product that gets repaired instead of discarded is a small win
          for the planet. FIKS makes repair the obvious, convenient choice by
          building a trusted community of repairers and repair-minded customers
          across Finland.
        </p>
        <p className={styles.sectionBody} style={{ marginTop: "0.75rem" }}>
          Manufacturing new goods is resource-intensive. Extending the life of
          what already exists — through repair, not replacement — cuts carbon
          emissions, reduces raw material demand, and keeps money circulating in
          local communities.
        </p>

        <div className={styles.missionCard} style={{ marginTop: "1.75rem" }}>
          <div className={styles.missionStat}>
            <span className={styles.missionStatNumber}>80%</span>
            <span className={styles.missionStatLabel}>
              of a product&apos;s environmental impact is locked in during manufacturing
            </span>
          </div>
          <div className={styles.missionStat}>
            <span className={styles.missionStatNumber}>5x</span>
            <span className={styles.missionStatLabel}>
              longer product lifetime dramatically reduces total lifecycle emissions
            </span>
          </div>
          <div className={styles.missionStat}>
            <span className={styles.missionStatNumber}>Local</span>
            <span className={styles.missionStatLabel}>
              repairers keeping skills, jobs, and money within your community
            </span>
          </div>
          <div className={styles.missionStat}>
            <span className={styles.missionStatNumber}>Zero</span>
            <span className={styles.missionStatLabel}>
              unnecessary waste when a good repair is all it takes
            </span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.section}>
        <p className={styles.sectionLabel}>How it works</p>
        <h2 className={styles.sectionTitle}>Three steps to fixed</h2>

        <div className={styles.steps}>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>1</span>
            <p className={styles.stepTitle}>Post your broken item</p>
            <p className={styles.stepDesc}>
              Describe what needs fixing, add a photo, and set your location.
              It takes less than two minutes to publish a repair listing.
            </p>
          </div>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>2</span>
            <p className={styles.stepTitle}>Get matched with a repairer</p>
            <p className={styles.stepDesc}>
              Local repairers with the right skills see your listing and apply.
              Browse their profiles, reviews, and proposed approach, then choose
              who you want to work with.
            </p>
          </div>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>3</span>
            <p className={styles.stepTitle}>Get it fixed</p>
            <p className={styles.stepDesc}>
              Coordinate directly with your repairer, hand over the item, and
              get it back good as new. Leave a review to help the community
              grow.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
