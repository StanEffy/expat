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
      style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
    >
      <img
        className={"expat-logo"}
        src={logoExpat}
        alt="Expat Logo"
        style={{ height: "20px", marginRight: "8px" }}
      />
    </Link>
  );

  const end = (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <LanguageSwitcher />
      <div className="hidden md:flex" style={{ display: "flex", gap: "8px" }}>
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
        paddingTop: "60px",
      }}
    >
      <Menubar start={start} end={end} className="layout-menubar" />
      <main style={{ flex: 1, width: "100%" }}>{children}</main>
      <footer
        style={{
          padding: "24px 16px",
          marginTop: "auto",
          backgroundColor: "#e0e0e0",
          width: "100%",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p
            style={{
              textAlign: "center",
              color: "#666",
              margin: 0,
              fontSize: "0.875rem",
            }}
          >
            © {new Date().getFullYear()} Expat. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
