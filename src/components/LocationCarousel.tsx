import Link from "next/link";
import styles from "./LocationCarousel.module.css";

export default function LocationCarousel() {
  const items = [
    {
      title: "Jeppo",
      desc: "See listings in Jeppo",
      link: "/s?location=jeppo",
      bgClass: "jeppo"
    },
    {
      title: "Vasa",
      desc: "See listings in Vasa",
      link: "/s?location=vasa",
      bgClass: "vasa",
    },
    {
      title: "Category: Clothes",
      desc: "See listings for clothes repair",
      link: "/s?category=clothes",
      bgClass: "clothes",
    }
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Explore listings, categories, or locations</h2>
            <p className={styles.subtitle}>Discover parts to repair or find talented repairers near you.</p>
          </div>
        </div>

        <div className={styles.carousel}>
          {items.map((item, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.cardImagePlaceholder}>
                {item.title}
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <Link href={item.link} className={styles.cardLink}>
                  {item.desc} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
