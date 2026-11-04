import styles from "./KipinaLogo.module.scss";

/** Spark: a four-point star in signal yellow. Shared by the logo and the chooser page. */
export const Spark = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
    <path d="M16 1 L19.5 12.5 L31 16 L19.5 19.5 L16 31 L12.5 19.5 L1 16 L12.5 12.5 Z" fill="var(--accent)" />
  </svg>
);

// Wordmark of the startup side: "kipinä" is Finnish for a spark
const KipinaLogo = () => (
  <span className={`${styles.logo} notranslate`} translate="no" lang="fi" role="img" aria-label="KIPINÄ">
    <Spark className={styles.spark} />
    <span className={styles.word} aria-hidden="true">KIPINÄ</span>
  </span>
);

export default KipinaLogo;
