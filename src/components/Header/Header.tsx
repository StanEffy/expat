import { useState, useRef, useEffect, lazy, Suspense } from "react";
import Button from "../Common/Button";
import { Menubar } from "primereact/menubar";
import { Badge } from "primereact/badge";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useSide } from "@/hooks/useSide";
import LanguageSwitcher from "../Common/LanguageSwitcher";
import ThemeSwitcher from "../Common/ThemeSwitcher";
import AnimatedLogo from "./AnimatedLogo";
import KipinaLogo from "./KipinaLogo";
import SideSwitch from "./SideSwitch";
import styles from "./Header.module.scss";
import { useUserNotifications } from "../../contexts/UserNotificationsContext";
import { SIDE_NAV, isGroup, isLinkActive, matchesPath, type NavGroup } from "@/components/Sides/sides";

const MobileMenu = lazy(() => import("../Navigation/MobileMenu"));

/** One dropdown of the side menu; closes on outside click, Escape and navigation. */
const NavDropdown = ({ group }: { group: NavGroup }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = `${group.id}_menu`;
  const active = group.items.some((item) => isLinkActive(pathname, item));

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.dropdownWrapper} ref={ref}>
      <Button
        text
        icon={group.icon}
        onClick={() => setOpen((prev) => !prev)}
        className={`${styles.navButton} ${styles.dropdownButton} ${active ? styles.active : ""} ${open ? styles.dropdownOpen : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
      >
        <span className={styles.dropdownButtonLabel}>
          {t(group.label)}
          <i className={`pi pi-chevron-down ${styles.dropdownChevron} ${open ? styles.chevronRotated : ""}`} />
        </span>
      </Button>
      {open && (
        <div id={menuId} className={styles.dropdownMenu} role="menu" aria-label={t(group.label)}>
          <ul className={styles.dropdownList} role="none">
            {group.items.map((item) => (
              <li key={item.to} role="none" className={styles.dropdownListItem}>
                <button
                  type="button"
                  className={`${styles.dropdownMenuItem} ${isLinkActive(pathname, item) ? styles.activeMenuItem : ""}`}
                  onClick={() => {
                    navigate(item.to);
                    setOpen(false);
                  }}
                  role="menuitem"
                >
                  <i className={`${item.icon} ${styles.menuItemIcon}`} />
                  <span className={styles.menuItemText}>{t(item.label)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { unreadCount } = useUserNotifications();
  const side = useSide();

  const isAboutActive = pathname === "/about";
  const isProfileActive =
    (pathname.startsWith("/profile") && !matchesPath(pathname, "/profile/resume-builder")) || pathname.startsWith("/admin");
  const isLoginActive = pathname === "/login" || pathname.startsWith("/password-reset");

  const start = (
    <div className={styles.start}>
      <Link to="/" className={styles.startLink} aria-label={t("sides.chooserLink")}>
        {side === "kipina" ? <KipinaLogo /> : <AnimatedLogo />}
      </Link>
      <SideSwitch side={side} className={styles.desktopOnly} />
    </div>
  );

  const end = (
    <div className={styles.end}>
      <div className={styles.desktopNavButtons}>
        {side &&
          SIDE_NAV[side].map((entry) =>
            isGroup(entry) ? (
              <NavDropdown key={entry.id} group={entry} />
            ) : (
              <Button
                key={entry.to}
                label={t(entry.label)}
                text
                icon={entry.icon}
                onClick={() => navigate(entry.to)}
                className={`${styles.navButton} ${isLinkActive(pathname, entry) ? styles.active : ""}`}
              />
            ),
          )}
        <Button
          label={t("navigation.about")}
          text
          icon="pi pi-info-circle"
          onClick={() => navigate("/about")}
          className={`${styles.navButton} ${isAboutActive ? styles.active : ""}`}
        />
        {isAuthenticated ? (
          <Button
            text
            icon="pi pi-user"
            onClick={() => navigate("/profile")}
            className={`${styles.navButton} ${isProfileActive ? styles.active : ""}`}
          >
            <span className={styles.profileButtonLabel}>
              {t("navigation.profile")}
              {unreadCount > 0 && <Badge value={unreadCount} severity="danger" />}
            </span>
          </Button>
        ) : (
          <Button
            label={t("navigation.login")}
            text
            icon="pi pi-sign-in"
            onClick={() => navigate("/login")}
            className={`${styles.navButton} ${isLoginActive ? styles.active : ""}`}
          />
        )}
      </div>
      <ThemeSwitcher />
      <LanguageSwitcher />
      <Suspense fallback={null}>
        <MobileMenu side={side} />
      </Suspense>
    </div>
  );

  return <Menubar start={start} end={end} className="layout-menubar" />;
};

export default Header;
