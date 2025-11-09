import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { Badge } from 'primereact/badge';
import { removeToken, removeAdmin2FASession, getAdmin2FASession } from '../../utils/auth';
import { ADMIN_PANEL_PATH } from '../../constants/api';
import { useTranslation } from 'react-i18next';
import styles from './AdminLayout.module.scss';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [has2FASession, setHas2FASession] = useState(false);

  useEffect(() => {
    setHas2FASession(!!getAdmin2FASession());
  }, []);

  const handleLogout = () => {
    removeToken();
    removeAdmin2FASession();
    navigate('/login');
  };

  const menuItems = [
    {
      label: t('admin.navigation.dashboard'),
      icon: 'pi pi-home',
      path: ADMIN_PANEL_PATH,
      command: () => {
        navigate(ADMIN_PANEL_PATH);
        setSidebarVisible(false);
      },
    },
    {
      label: t('admin.navigation.users'),
      icon: 'pi pi-users',
      path: `${ADMIN_PANEL_PATH}/users`,
      command: () => {
        navigate(`${ADMIN_PANEL_PATH}/users`);
        setSidebarVisible(false);
      },
    },
    {
      label: t('admin.navigation.companyUpdates'),
      icon: 'pi pi-building',
      path: `${ADMIN_PANEL_PATH}/company-updates`,
      command: () => {
        navigate(`${ADMIN_PANEL_PATH}/company-updates`);
        setSidebarVisible(false);
      },
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            icon="pi pi-bars"
            onClick={() => setSidebarVisible(true)}
            text
            rounded
            className={styles.menuButton}
          />
          <h1 className={styles.title}>{t('admin.title')}</h1>
          {/* Desktop navigation */}
          <nav className={styles.desktopNav}>
            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                onClick={item.command}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className={styles.headerRight}>
          {!has2FASession && (
            <Badge
              value={t('admin.2fa.sessionExpired')}
              severity="warning"
              className={styles.sessionBadge}
            />
          )}
          <Button
            label={t('admin.logout')}
            icon="pi pi-sign-out"
            onClick={handleLogout}
            severity="secondary"
            text
            className={styles.logoutButton}
          />
        </div>
      </header>

      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        className={styles.sidebar}
      >
        <div className={styles.sidebarContent}>
          <h2 className={styles.sidebarTitle}>{t('admin.navigation.title')}</h2>
          <nav className={styles.nav}>
            {menuItems.map((item) => (
              <button
                key={item.path}
                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
                onClick={item.command}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </Sidebar>

      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default AdminLayout;


