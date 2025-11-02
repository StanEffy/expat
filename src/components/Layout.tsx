import { ReactNode, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { Link, useNavigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";
import MobileMenu from "./MobileMenu";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import logoExpat from "../assets/logo_expat.png";
import "./Layout.scss";
import styles from "./Layout.module.scss";

interface LayoutProps {
  children: ReactNode;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const Layout = ({ children }: LayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(isTokenValid());
  }, []);

  const start = (
    <Link
      to="/"
      className={styles.startLink}
    >
      <img
        className={"expat-logo"}
        src={logoExpat}
        alt="Expat Logo"
        className={styles.logo}
      />
    </Link>
  );

  const end = (
    <div className={styles.end}>
      <LanguageSwitcher />
      <div className={`hidden md:flex ${styles.desktopNavButtons}`}>
        <Button
          label={t("navigation.companies")}
          text
          onClick={() => navigate("/companies")}
        />
        {isAuthenticated ? (
          <Button
            label={t("navigation.profile")}
            text
            onClick={() => navigate("/profile")}
          />
        ) : (
          <Button
            label={t("navigation.login")}
            text
            onClick={() => navigate("/login")}
          />
        )}
      </div>
      <MobileMenu />
    </div>
  );

  return (
    <div className={"wrapper"}>
      <Menubar start={start} end={end} className="layout-menubar" />
      <main className={"main"}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            © {new Date().getFullYear()} Expat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
