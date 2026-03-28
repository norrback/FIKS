import Link from "next/link";
import styles from "./HowItWorks.module.css";

export default function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Post a broken part",
      desc: "List the product you need repaired. Add photos, describe the issue, and select the location of the item.",
      link: "/create-listing",
      linkText: "Post a repair need",
    },
    {
      num: "2",
      title: "List a service",
      desc: "Are you a repairer? Create your profile, list your skills, and showcase your past successful 'Repair Stories'.",
      link: "/signup",
      linkText: "List a repair service",
    },
    {
      num: "3",
      title: "Match & Fix",
      desc: "Find parts to fix or find repairers for your parts. Agree on the details, location, and price seamlessly.",
      link: "/listings",
      linkText: "Search listings",
    },
    {
      num: "4",
      title: "Secure Payment",
      desc: "Pay securely online. FIKS holds your money until the repair is confirmed and completed.",
      link: "/inbox",
      linkText: "Go to Inbox",
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>How things work here.</h2>
        <div className={styles.grid}>
          {steps.map((step, index) => (
            <Link key={index} href={step.link} className={styles.step}>
              <div className={styles.iconWrapper}>{step.num}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              <span className={styles.stepCta}>
                {step.linkText} &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
