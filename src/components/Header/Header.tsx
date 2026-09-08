import { useMemo, lazy, Suspense } from "react";
import Button from "../Common/Button";
import { Menubar } from "primereact/menubar";
import { Badge } from "primereact/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import LanguageSwitcher from "../Common/LanguageSwitcher";
import AnimatedLogo from "./AnimatedLogo";
import styles from "./Header.module.scss";
import { useUserNotifications } from "../../contexts/UserNotificationsContext";

const MobileMenu = lazy(() => import("../Navigation/MobileMenu"));

const Header = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useUserNotifications();

  const isCompaniesActive = location.pathname.startsWith("/companies") || location.pathname === "/categories";
  const isShopActive = location.pathname.startsWith("/shop");
  const isPollsActive = location.pathname.startsWith("/polls");
  const isOnboardingActive = location.pathname.startsWith("/onboarding");
  const isBudgetingActive = location.pathname.startsWith("/participatory-budget");
  const isServiceRequestsActive = location.pathname.startsWith("/service-requests");
  const isCommunityActive = location.pathname.startsWith("/community");
  const isMunicipalAnalyticsActive = location.pathname.startsWith("/municipal-dashboard");
  const isAboutActive = location.pathname === "/about";
  const isProfileActive = location.pathname.startsWith("/profile") || location.pathname.startsWith("/admin");
  const isLoginActive = location.pathname === "/login" || location.pathname.startsWith("/password-reset");

  const profileButtonContent = useMemo(() => {
    if (!isAuthenticated) {
      return t("navigation.profile");
    }

    return (
      <span className={styles.profileButtonLabel}>
        {t("navigation.profile")}
        {unreadCount > 0 && (
          <Badge value={unreadCount} severity="danger" />
        )}
      </span>
    );
  }, [isAuthenticated, t, unreadCount]);

  const start = (
    <Link to="/" className={styles.startLink} aria-label="Home">
      <AnimatedLogo />
    </Link>
  );

  const end = (
    <div className={styles.end}>
      <div className={styles.desktopNavButtons}>
        <Button
          label={t("navigation.companies")}
          text
          icon="pi pi-building"
          onClick={() => navigate("/companies")}
          className={`${styles.navButton} ${isCompaniesActive ? styles.active : ''}`}
        />
        <Button
          label={t("navigation.onboarding")}
          text
          icon="pi pi-compass"
          onClick={() => navigate("/onboarding")}
          className={`${styles.navButton} ${isOnboardingActive ? styles.active : ''}`}
        />
        <Button
          label={t("navigation.participatoryBudget")}
          text
          icon="pi pi-wallet"
          onClick={() => navigate("/participatory-budget")}
          className={`${styles.navButton} ${isBudgetingActive ? styles.active : ''}`}
        />
        <Button
          label={t("navigation.serviceRequests")}
          text
          icon="pi pi-inbox"
          onClick={() => navigate("/service-requests")}
          className={`${styles.navButton} ${isServiceRequestsActive ? styles.active : ''}`}
        />
        <Button
          label={t("navigation.community")}
          text
          icon="pi pi-users"
          onClick={() => navigate("/community")}
          className={`${styles.navButton} ${isCommunityActive ? styles.active : ''}`}
        />
        <Button
          label={t("navigation.shop")}
          text
          icon="pi pi-shopping-bag"
          onClick={() => navigate("/shop")}
          className={`${styles.navButton} ${isShopActive ? styles.active : ''}`}
        />
        <Button
          label={t("navigation.polls")}
          text
          icon="pi pi-chart-bar"
          onClick={() => navigate("/polls")}
          className={`${styles.navButton} ${isPollsActive ? styles.active : ''}`}
        />
        <Button
          label={t("navigation.municipalAnalytics")}
          text
          icon="pi pi-chart-line"
          onClick={() => navigate("/municipal-dashboard")}
          className={`${styles.navButton} ${isMunicipalAnalyticsActive ? styles.active : ''}`}
        />
        <Button
          label={t("navigation.about")}
          text
          icon="pi pi-info-circle"
          onClick={() => navigate("/about")}
          className={`${styles.navButton} ${isAboutActive ? styles.active : ''}`}
        />
        {isAuthenticated ? (
          <Button
            text
            icon="pi pi-user"
            onClick={() => navigate("/profile")}
            className={`${styles.navButton} ${isProfileActive ? styles.active : ''}`}
          >
            {profileButtonContent}
          </Button>
        ) : (
          <Button
            label={t("navigation.login")}
            text
            icon="pi pi-sign-in"
            onClick={() => navigate("/login")}
            className={`${styles.navButton} ${isLoginActive ? styles.active : ''}`}
          />
        )}
      </div>
      <LanguageSwitcher />
      <Suspense fallback={null}>
        <MobileMenu />
      </Suspense>
    </div>
  );

  return <Menubar start={start} end={end} className="layout-menubar" />;
};

export default Header;

