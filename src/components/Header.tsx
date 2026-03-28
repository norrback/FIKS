import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          FIKS.
        </Link>
        
        <div className={styles.search}>
          <input 
            type="text" 
            placeholder="Search for repairers or broken parts..." 
            className={styles.searchInput}
          />
        </div>

        <div className={styles.actions}>
          <Link href="/login" className={styles.loginLink}>Log in</Link>
          <Link href="/signup" className={styles.loginLink}>Sign up</Link>
          <Link href="/new" className="btn btn-primary">
            Post a Listing
          </Link>
        </div>
      </div>
    </header>
  );
}
