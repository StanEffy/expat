import styles from "./Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Expat. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

