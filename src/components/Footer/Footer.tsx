import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styles from "./Footer.module.scss";

// Open data we show is licensed CC BY 4.0, which requires naming the source.
const SOURCES = [
  { key: "companies", href: "https://avoindata.prh.fi/" },
  { key: "places", href: "https://stat.fi/org/avoindata_en.html" },
] as const;

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p className={styles.footerText}>
          © {new Date().getFullYear()} Expat. {t("footer.rights")}{" "}
          {/* merch is not part of either side, so it lives down here */}
          <Link to="/shop" className={styles.footerLink}>
            {t("navigation.shop")}
          </Link>
        </p>
        <p className={styles.footerMark} translate="no">
          SUOMI / FINLAND <span aria-hidden="true">→</span>
        </p>
        <p className={styles.sources}>
          <span className={styles.sourcesLabel}>{t("footer.sources")}:</span>{" "}
          {SOURCES.map(({ key, href }, i) => (
            <span key={key}>
              {i > 0 && " · "}
              <a href={href} target="_blank" rel="noopener noreferrer">
                {t(`footer.${key}`)}
              </a>
            </span>
          ))}
          {" · "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer license"
          >
            {t("footer.license")}
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
