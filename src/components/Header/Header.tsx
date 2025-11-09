import { useEffect, useState } from "react";
import Button from "../Common/Button";
import { Menubar } from "primereact/menubar";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isTokenValid } from "../../utils/auth";
import LanguageSwitcher from "../Common/LanguageSwitcher";
import MobileMenu from "../Navigation/MobileMenu";
import AnimatedLogo from "./AnimatedLogo";
import styles from "./Header.module.scss";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuthenticated(isTokenValid());
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

  return <Menubar start={start} end={end} className="layout-menubar" />;
};

export default Header;

