import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <Link href="/" className={styles.brand}>FIKS.</Link>
            <p className={styles.desc}>
              The repair matchmaker. Connecting broken products with skilled repairers to extend lifetimes and decrease emissions.
            </p>
          </div>
          
          <div>
            <h4 className={styles.heading}>Discover</h4>
            <ul className={styles.linkList}>
              <li><Link href="/about" className={styles.link}>About us</Link></li>
              <li><Link href="/listings" className={styles.link}>Search listings</Link></li>
              <li><Link href="/create-listing" className={styles.link}>Post a broken part</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.heading}>Legal</h4>
            <ul className={styles.linkList}>
              <li><Link href="/terms" className={styles.link}>Terms of Service</Link></li>
              <li><Link href="/privacy" className={styles.link}>Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} FIKS Marketplace.</p>
          <p>Powered by Next.js</p>
        </div>
      </div>
    </footer>
  );
}
