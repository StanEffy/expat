import { useState, useRef, useEffect } from "react";
import Button from "../Common/Button";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserNotifications } from "../../contexts/UserNotificationsContext";
import "./MobileMenu.scss";

const MobileMenu = () => {
  const menu = useRef<Menu>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useUserNotifications();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isHomeActive = location.pathname === "/";
  const isCompaniesActive = location.pathname.startsWith("/companies") || location.pathname === "/categories";
  const isOnboardingActive = location.pathname.startsWith("/onboarding");
  const isBudgetingActive = location.pathname.startsWith("/participatory-budget");
  const isServiceRequestsActive = location.pathname.startsWith("/service-requests");
  const isCommunityActive = location.pathname.startsWith("/community");
  const isShopActive = location.pathname.startsWith("/shop");
  const isPollsActive = location.pathname.startsWith("/polls");
  const isMunicipalAnalyticsActive = location.pathname.startsWith("/municipal-dashboard");
  const isAboutActive = location.pathname === "/about";
  const isProfileActive = location.pathname.startsWith("/profile") || location.pathname.startsWith("/admin");
  const isLoginActive = location.pathname === "/login" || location.pathname.startsWith("/password-reset");

  const items: MenuItem[] = [
    {
      label: t("navigation.home"),
      icon: "pi pi-home",
      className: isHomeActive ? "active-menuitem" : "",
      command: () => handleNavigation("/"),
    },
    {
      label: t("navigation.companies"),
      icon: "pi pi-building",
      className: isCompaniesActive ? "active-menuitem" : "",
      command: () => handleNavigation("/companies"),
    },
    { separator: true },
    {
      label: t("navigation.onboarding"),
      icon: "pi pi-compass",
      className: isOnboardingActive ? "active-menuitem" : "",
      command: () => handleNavigation("/onboarding"),
    },
    {
      label: t("navigation.participatoryBudget"),
      icon: "pi pi-wallet",
      className: isBudgetingActive ? "active-menuitem" : "",
      command: () => handleNavigation("/participatory-budget"),
    },
    {
      label: t("navigation.serviceRequests"),
      icon: "pi pi-inbox",
      className: isServiceRequestsActive ? "active-menuitem" : "",
      command: () => handleNavigation("/service-requests"),
    },
    {
      label: t("navigation.community"),
      icon: "pi pi-users",
      className: isCommunityActive ? "active-menuitem" : "",
      command: () => handleNavigation("/community"),
    },
    {
      label: t("navigation.municipalAnalytics"),
      icon: "pi pi-chart-line",
      className: isMunicipalAnalyticsActive ? "active-menuitem" : "",
      command: () => handleNavigation("/municipal-dashboard"),
    },
    { separator: true },
    {
      label: t("navigation.shop"),
      icon: "pi pi-shopping-bag",
      className: isShopActive ? "active-menuitem" : "",
      command: () => handleNavigation("/shop"),
    },
    {
      label: t("navigation.polls"),
      icon: "pi pi-chart-bar",
      className: isPollsActive ? "active-menuitem" : "",
      command: () => handleNavigation("/polls"),
    },
    {
      label: t("navigation.about"),
      icon: "pi pi-info-circle",
      className: isAboutActive ? "active-menuitem" : "",
      command: () => handleNavigation("/about"),
    },
    { separator: true },
    isAuthenticated
      ? {
          label: unreadCount > 0 ? `${t("navigation.profile")} (${unreadCount})` : t("navigation.profile"),
          icon: "pi pi-user",
          className: isProfileActive ? "active-menuitem" : "",
          command: () => handleNavigation("/profile"),
        }
      : {
          label: t("navigation.login"),
          icon: "pi pi-sign-in",
          className: isLoginActive ? "active-menuitem" : "",
          command: () => handleNavigation("/login"),
        },
  ];

  if (!isMobile) {
    return null;
  }

  return (
    <>
      <Button
        icon="pi pi-bars"
        text
        rounded
        aria-label="menu"
        className="mobile-menu-trigger"
        onClick={(e) => menu.current?.toggle(e)}
      />
      <Menu ref={menu} model={items} popup className="mobile-menu" />
    </>
  );
};

export default MobileMenu;
