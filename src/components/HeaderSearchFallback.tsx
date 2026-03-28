import styles from "./Header.module.css";

/** Static shell while `HeaderSearch` Suspense boundary resolves (useSearchParams). */
export default function HeaderSearchFallback() {
  return (
    <div className={styles.search} aria-hidden>
      <input
        type="search"
        className={styles.searchInput}
        placeholder="Search for repairers or broken parts..."
        disabled
        readOnly
        tabIndex={-1}
        aria-label="Search listings"
      />
    </div>
  );
}
