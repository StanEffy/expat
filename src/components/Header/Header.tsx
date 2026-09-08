import { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const isCityServicesActive =
    isOnboardingActive ||
    isBudgetingActive ||
    isServiceRequestsActive ||
    isCommunityActive ||
    isMunicipalAnalyticsActive;

  const cityServicesItems = useMemo(
    () => [
      {
        label: t("navigation.onboarding"),
        icon: "pi pi-compass",
        className: isOnboardingActive ? "active-menuitem" : "",
        command: () => navigate("/onboarding"),
      },
      {
        label: t("navigation.participatoryBudget"),
        icon: "pi pi-wallet",
        className: isBudgetingActive ? "active-menuitem" : "",
        command: () => navigate("/participatory-budget"),
      },
      {
        label: t("navigation.serviceRequests"),
        icon: "pi pi-inbox",
        className: isServiceRequestsActive ? "active-menuitem" : "",
        command: () => navigate("/service-requests"),
      },
      {
        label: t("navigation.community"),
        icon: "pi pi-users",
        className: isCommunityActive ? "active-menuitem" : "",
        command: () => navigate("/community"),
      },
      {
        label: t("navigation.municipalAnalytics"),
        icon: "pi pi-chart-line",
        className: isMunicipalAnalyticsActive ? "active-menuitem" : "",
        command: () => navigate("/municipal-dashboard"),
      },
    ],
    [
      t,
      navigate,
      isOnboardingActive,
      isBudgetingActive,
      isServiceRequestsActive,
      isCommunityActive,
      isMunicipalAnalyticsActive,
    ]
  );

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

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
        <div className={styles.dropdownWrapper} ref={dropdownRef}>
          <Button
            text
            icon="pi pi-building-columns"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`${styles.navButton} ${styles.dropdownButton} ${isCityServicesActive ? styles.active : ''} ${isDropdownOpen ? styles.dropdownOpen : ''}`}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-controls="city_services_menu"
          >
            <span className={styles.dropdownButtonLabel}>
              {t("navigation.cityServices")}
              <i className={`pi pi-chevron-down ${styles.dropdownChevron} ${isDropdownOpen ? styles.chevronRotated : ''}`} />
            </span>
          </Button>
          {isDropdownOpen && (
            <div
              id="city_services_menu"
              className={styles.dropdownMenu}
              role="menu"
              aria-label={t("navigation.cityServices")}
            >
              <ul className={styles.dropdownList} role="none">
                {cityServicesItems.map((item) => (
                  <li key={item.label} role="none" className={styles.dropdownListItem}>
                    <button
                      type="button"
                      className={`${styles.dropdownMenuItem} ${item.className === 'active-menuitem' ? styles.activeMenuItem : ''}`}
                      onClick={() => {
                        item.command();
                        setIsDropdownOpen(false);
                      }}
                      role="menuitem"
                    >
                      <i className={`${item.icon} ${styles.menuItemIcon}`} />
                      <span className={styles.menuItemText}>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
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

