import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ADMIN_ENDPOINTS } from '../../constants/api';
import { getAdminHeaders } from '../../utils/auth';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/SEO';
import styles from './AdminDashboard.module.scss';

interface DashboardStats {
  totalUsers: number;
  pendingUpdates: number;
  approvedUpdates: number;
  rejectedUpdates: number;
}

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');

    try {
      const headers = getAdminHeaders();
      if (!headers) {
        setError(t('admin.errors.unauthorized'));
        return;
      }

      // Fetch users count
      const usersResponse = await fetch(ADMIN_ENDPOINTS.USERS, { headers });
      const usersData = usersResponse.ok ? await usersResponse.json() : { data: [] };

      // Fetch pending updates
      const pendingResponse = await fetch(ADMIN_ENDPOINTS.COMPANY_UPDATES('pending'), { headers });
      const pendingData = pendingResponse.ok ? await pendingResponse.json() : { data: [] };

      // Fetch approved updates
      const approvedResponse = await fetch(ADMIN_ENDPOINTS.COMPANY_UPDATES('approved'), { headers });
      const approvedData = approvedResponse.ok ? await approvedResponse.json() : { data: [] };

      // Fetch rejected updates
      const rejectedResponse = await fetch(ADMIN_ENDPOINTS.COMPANY_UPDATES('rejected'), { headers });
      const rejectedData = rejectedResponse.ok ? await rejectedResponse.json() : { data: [] };

      setStats({
        totalUsers: Array.isArray(usersData.data) ? usersData.data.length : 0,
        pendingUpdates: Array.isArray(pendingData.data) ? pendingData.data.length : 0,
        approvedUpdates: Array.isArray(approvedData.data) ? approvedData.data.length : 0,
        rejectedUpdates: Array.isArray(rejectedData.data) ? rejectedData.data.length : 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (loading) {
    return (
      <>
        <SEO
          title={`${t('admin.navigation.dashboard')} - ${t('app.title')}`}
          description="Admin dashboard"
          url={currentUrl}
          noindex={true}
        />
        <div className={styles.container}>
          <div className={styles.loading}>
            <ProgressSpinner />
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title={`${t('admin.navigation.dashboard')} - ${t('app.title')}`}
          description="Admin dashboard"
          url={currentUrl}
          noindex={true}
        />
        <div className={styles.container}>
          <p className={styles.error}>{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${t('admin.navigation.dashboard')} - ${t('app.title')}`}
        description="Admin dashboard"
        url={currentUrl}
        noindex={true}
      />
      <div className={styles.container}>
        <h1 className={styles.title}>{t('admin.navigation.dashboard')}</h1>

        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <i className="pi pi-users"></i>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{stats?.totalUsers || 0}</h3>
                <p className={styles.statLabel}>{t('admin.dashboard.totalUsers')}</p>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <i className="pi pi-clock"></i>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{stats?.pendingUpdates || 0}</h3>
                <p className={styles.statLabel}>{t('admin.dashboard.pendingUpdates')}</p>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <i className="pi pi-check-circle"></i>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{stats?.approvedUpdates || 0}</h3>
                <p className={styles.statLabel}>{t('admin.dashboard.approvedUpdates')}</p>
              </div>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statIcon}>
                <i className="pi pi-times-circle"></i>
              </div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{stats?.rejectedUpdates || 0}</h3>
                <p className={styles.statLabel}>{t('admin.dashboard.rejectedUpdates')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;


