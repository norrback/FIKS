import Link from "next/link";
import styles from "./LocationCarousel.module.css";

/** Placeholder “paid placement” repairers — slugs must exist in DB (see prisma/seed.ts). */
const promotedRepairers = [
  {
    slug: "demo-repairer",
    name: "Demo Repairer",
    initials: "DR",
    tagline: "Electronics, small appliances, and soldering in the capital region.",
    expertise: ["Electronics", "Small appliances"],
    location: "Helsinki area",
    ratingText: "4.7",
    ratingCount: 3,
    headerClass: styles.cardHeaderA,
  },
  {
    slug: "nord-som-atelje",
    name: "NordSöm Atelje",
    initials: "NA",
    tagline: "Alterations, zippers, and outerwear — studio work with quick turnaround.",
    expertise: ["Textiles", "Clothing"],
    location: "Vaasa",
    ratingText: "5.0",
    ratingCount: 2,
    headerClass: styles.cardHeaderB,
  },
  {
    slug: "lumo-pyorapaja",
    name: "Lumo Pyöräpaja",
    initials: "LP",
    tagline: "Tune-ups, wheel truing, and drivetrain repairs for daily riders.",
    expertise: ["Bicycles", "Wheel building"],
    location: "Seinäjoki",
    ratingText: "4.8",
    ratingCount: 4,
    headerClass: styles.cardHeaderC,
  },
] as const;

export default function LocationCarousel() {
  return (
    <section className={styles.section} aria-labelledby="featured-repairers-heading">
      <div className="container">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Featured repairers</p>
            <h2 id="featured-repairers-heading" className={styles.title}>
              Repairers highlighted on FIKS
            </h2>
            <p className={styles.subtitle}>
              These profiles are shown as examples of extra visibility for repairers who choose
              marketing on the platform. Slots can be sold or curated as you grow.
            </p>
          </div>
        </div>

        <div className={styles.carousel}>
          {promotedRepairers.map((r) => (
            <Link key={r.slug} href={`/repairers/${r.slug}`} className={styles.card}>
              <div className={`${styles.cardHeader} ${r.headerClass}`}>
                <span className={styles.featuredBadge}>Featured</span>
                <span className={styles.avatar} aria-hidden>
                  {r.initials}
                </span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{r.name}</h3>
                <p className={styles.tagline}>{r.tagline}</p>
                <ul className={styles.expertise} aria-label="Expertise">
                  {r.expertise.map((tag) => (
                    <li key={tag} className={styles.expertiseTag}>
                      {tag}
                    </li>
                  ))}
                </ul>
                <div className={styles.meta}>
                  <span>{r.location}</span>
                  <span className={styles.rating} aria-label={`${r.ratingText} out of 5 from ${r.ratingCount} reviews`}>
                    ★ {r.ratingText}{" "}
                    <span className={styles.ratingCount}>({r.ratingCount})</span>
                  </span>
                </div>
                <span className={styles.cardLink}>View profile →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
