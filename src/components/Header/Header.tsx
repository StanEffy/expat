import { useEffect, useMemo, useState } from "react";
import Button from "../Common/Button";
import { Menubar } from "primereact/menubar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isTokenValid } from "../../utils/auth";
import LanguageSwitcher from "../Common/LanguageSwitcher";
import MobileMenu from "../Navigation/MobileMenu";
import AnimatedLogo from "./AnimatedLogo";
import styles from "./Header.module.scss";
import { Badge } from "primereact/badge";
import { useUserNotifications } from "../../contexts/UserNotificationsContext";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useUserNotifications();

  useEffect(() => {
    setIsAuthenticated(isTokenValid());
  }, [location]);

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
          label={t("navigation.polls")}
          text
          onClick={() => navigate("/polls")}
        />
        <Button
          label={t("navigation.about")}
          text
          onClick={() => navigate("/about")}
        />
        {isAuthenticated ? (
          <Button
            text
            onClick={() => navigate("/profile")}
          >
            {profileButtonContent}
          </Button>
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

  return <Menubar start={start} end={end} className="layout-menubar" />;
};

export default Header;

