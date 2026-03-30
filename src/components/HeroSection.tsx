import Link from "next/link";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <h1 className={styles.title}>
          At FIKS we connect broken products with expert repairers.
        </h1>
        <p className={styles.subtitle}>
          Extend the lifetime of the products you own. Find a local repairer to fix broken items; it&apos;s a simple way to reduce waste and stop using new resources needlessly. It&apos;s a win-win for everyone.
        </p>
        
        <div className={styles.actions}>
          <Link href="/create-listing" className={`btn btn-primary ${styles.primaryBtn}`}>
            Post a Broken Part
          </Link>
          <Link href="/signup" className={`btn btn-secondary ${styles.secondaryBtn}`}>
            List your Repair Service
          </Link>
        </div>
      </div>
    </section>
  );
}
