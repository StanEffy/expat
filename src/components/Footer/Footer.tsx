import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Expat. All rights reserved.
        </p>
        <p className={styles.footerMark} translate="no">
          SUOMI / FINLAND <span aria-hidden="true">→</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
