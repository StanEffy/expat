import { ReactNode, useState, useEffect, lazy, Suspense } from "react";
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { Link, useNavigate } from "react-router-dom";
import { isTokenValid } from "../utils/auth";
import MobileMenu from "./MobileMenu";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import "./Layout.scss";
import styles from "./Layout.module.scss";
import AnimatedLogo from "./AnimatedLogo.tsx";

const GlowingShapes = lazy(() => import("./GlowingShapes"));

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

  // Safari backdrop-filter polyfill detection
  useEffect(() => {
    const checkBackdropFilterSupport = () => {
      // Create a test element with backdrop-filter
      const testElement = document.createElement("div");
      testElement.style.position = "fixed";
      testElement.style.top = "-9999px";
      testElement.style.left = "-9999px";
      testElement.style.width = "1px";
      testElement.style.height = "1px";
      testElement.style.backdropFilter = "blur(1px)";
      // Set the prefixed property via setProperty to avoid TS errors
      testElement.style.setProperty("-webkit-backdrop-filter", "blur(1px)");
      document.body.appendChild(testElement);

      // Check if backdrop-filter is actually supported
      const computedStyle = window.getComputedStyle(testElement);
      const webkitValue = computedStyle.getPropertyValue(
        "-webkit-backdrop-filter",
      );
      const stdValue =
        (computedStyle as any).backdropFilter ||
        computedStyle.getPropertyValue("backdrop-filter");
      const hasBackdropFilter =
        (typeof stdValue === "string" &&
          stdValue.trim() !== "" &&
          stdValue.trim() !== "none") ||
        (typeof webkitValue === "string" &&
          webkitValue.trim() !== "" &&
          webkitValue.trim() !== "none") ||
        // Fallback check using CSS.supports if available
        (window.CSS &&
          window.CSS.supports &&
          (window.CSS.supports("-webkit-backdrop-filter", "blur(1px)") ||
            window.CSS.supports("backdrop-filter", "blur(1px)")));

      document.body.removeChild(testElement);

      // Add class to body if backdrop-filter is not supported
      if (!hasBackdropFilter) {
        document.body.classList.add("no-backdrop-filter");
      } else {
        document.body.classList.remove("no-backdrop-filter");
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkBackdropFilterSupport, 100);

    // Also check immediately and on events
    checkBackdropFilterSupport();

    // Recheck on resize/orientation change (for iOS Safari)
    window.addEventListener("resize", checkBackdropFilterSupport);
    window.addEventListener("orientationchange", checkBackdropFilterSupport);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkBackdropFilterSupport);
      window.removeEventListener(
        "orientationchange",
        checkBackdropFilterSupport,
      );
    };
  }, []);

  const start = (
    <Link to="/" className={styles.startLink}>
      <AnimatedLogo />
    </Link>
  );

  const end = (
    <div className={styles.end}>
      <div className={styles.desktopNavButtons}>
        <Button
          label={t("navigation.companies")}
          text
          onClick={() => navigate("/companies")}
        />
        <Button
          label={t("navigation.shop")}
          text
          onClick={() => navigate("/shop")}
        />
        <Button
          label={t("navigation.about")}
          text
          onClick={() => navigate("/about")}
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
      <LanguageSwitcher />
      <MobileMenu />
    </div>
  );

  return (
    <div className={"wrapper"}>
      {/*<GeometricBackground />*/}
      <Suspense fallback={null}>
        <GlowingShapes />
      </Suspense>
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
