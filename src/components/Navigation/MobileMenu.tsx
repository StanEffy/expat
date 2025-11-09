import { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./MobileMenu.scss";

const MobileMenu = () => {
  const menu = useRef<Menu>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const items = [
    {
      label: t("navigation.home"),
      command: () => handleNavigation("/"),
    },
    {
      label: t("navigation.companies"),
      command: () => handleNavigation("/companies"),
    },
    {
      label: t("navigation.shop"),
      command: () => handleNavigation("/shop"),
    },
    {
      label: t("navigation.polls"),
      command: () => handleNavigation("/polls"),
    },
    {
      label: t("navigation.about"),
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
        onClick={(e) => menu.current?.toggle(e)}
      />
      <Menu ref={menu} model={items} popup className="mobile-menu" />
    </>
  );
};

export default MobileMenu;
