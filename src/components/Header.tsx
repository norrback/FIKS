import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          <Image src="/fiks_logo.avif" alt="FIKS." width={0} height={0} sizes="100vw" style={{ width: "auto", height: "36px" }} priority />
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
          <Link href="/create-listing" className="btn btn-primary">
            Post a Listing
          </Link>
        </div>
      </div>
    </header>
  );
}
