import { useState, useRef, useEffect, useCallback } from "react";
import Button from "../Common/Button";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserNotifications } from "../../contexts/UserNotificationsContext";
import { SIDE_HOME, SIDE_NAV, isGroup, isLinkActive, matchesPath, type NavLink, type Side } from "@/components/Sides/sides";
import "./MobileMenu.scss";

const MobileMenu = ({ side }: { side: Side | null }) => {
  const menu = useRef<Menu>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useUserNotifications();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = useCallback((event?: React.SyntheticEvent | Event) => {
    if (menu.current) {
      const fallback = triggerRef.current ?? (typeof document !== "undefined" ? document.body : null);
      const safeEvent = {
        currentTarget: (event && "currentTarget" in event && event.currentTarget) ? event.currentTarget : fallback,
        target: (event && "target" in event && event.target) ? event.target : fallback,
      } as unknown as React.SyntheticEvent;

      try {
        menu.current.hide(safeEvent);
      } catch {
        // Gracefully ignore if already hidden or unmounted
      }
    }
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1200;
      setIsMobile(mobile);
      if (!mobile) {
        closeMenu();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMenu]);

  const handleNavigation = (path: string) => {
    closeMenu();
    navigate(path);
  };

  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      closeMenu();
    }
  }, [location.pathname, closeMenu]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const menuEl = menu.current?.getElement();
      const triggerEl = triggerRef.current;

      if (triggerEl && (triggerEl === target || triggerEl.contains(target))) {
        return;
      }
      if (menuEl && (menuEl === target || menuEl.contains(target))) {
        return;
      }

      closeMenu(event);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(event);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick, true);
    document.addEventListener("touchstart", handleOutsideClick, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick, true);
      document.removeEventListener("touchstart", handleOutsideClick, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  const pathname = location.pathname;
  const isAboutActive = pathname === "/about";
  const isProfileActive =
    (pathname.startsWith("/profile") && !matchesPath(pathname, "/profile/resume-builder")) || pathname.startsWith("/admin");
  const isLoginActive = pathname === "/login" || pathname.startsWith("/password-reset");

  const toItem = (link: NavLink): MenuItem => ({
    label: t(link.label),
    icon: link.icon,
    className: isLinkActive(pathname, link) ? "active-menuitem" : "",
    command: () => handleNavigation(link.to),
  });

  // Side switch first, then the current side's menu with groups flattened
  const sideItems: MenuItem[] = (["expat", "kipina"] as Side[]).map((s) => ({
    label: s === "expat" ? "EXPAT" : "KIPINÄ",
    icon: s === "expat" ? "pi pi-building" : "pi pi-sparkles",
    className: `mobile-menu-side ${side === s ? "active-menuitem" : ""}`,
    command: () => handleNavigation(SIDE_HOME[s]),
  }));

  const navItems: MenuItem[] = [];
  if (side) {
    for (const entry of SIDE_NAV[side]) {
      if (isGroup(entry)) {
        navItems.push({ separator: true }, ...entry.items.map(toItem), { separator: true });
      } else {
        navItems.push(toItem(entry));
      }
    }
  }

  const items: MenuItem[] = [
    ...sideItems,
    { separator: true },
    ...navItems,
    { separator: true },
    {
      label: t("navigation.about"),
      icon: "pi pi-info-circle",
      className: isAboutActive ? "active-menuitem" : "",
      command: () => handleNavigation("/about"),
    },
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
  ].filter((item, i, all) => !(item.separator && (i === 0 || all[i - 1].separator)));

  if (!isMobile) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            closeMenu();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            closeMenu();
          }}
          aria-hidden="true"
        />
      )}
      <div ref={triggerRef} className="mobile-menu-trigger-wrapper">
        <Button
          icon="pi pi-bars"
          text
          rounded
          aria-label="menu"
          aria-expanded={isOpen}
          className={`mobile-menu-trigger ${isOpen ? "mobile-menu-trigger-active" : ""}`}
          onClick={(e) => {
            if (isOpen) {
              closeMenu();
            } else {
              menu.current?.show(e);
              setIsOpen(true);
            }
          }}
        />
      </div>
      <Menu
        ref={menu}
        model={items}
        popup
        className="mobile-menu"
        onShow={() => setIsOpen(true)}
        onHide={() => setIsOpen(false)}
      />
    </>
  );
};

export default MobileMenu;
