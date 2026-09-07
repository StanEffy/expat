import { useState, useRef, useEffect } from "react";
import Button from "../Common/Button";
import { Menu } from "primereact/menu";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import "./MobileMenu.scss";

const MobileMenu = () => {
  const menu = useRef<Menu>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    // Menu will auto-close on navigation
  };

  const isHomeActive = location.pathname === "/";
  const isCompaniesActive = location.pathname.startsWith("/companies") || location.pathname === "/categories";
  const isShopActive = location.pathname.startsWith("/shop");
  const isPollsActive = location.pathname.startsWith("/polls");
  const isAboutActive = location.pathname === "/about";

  const items = [
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
