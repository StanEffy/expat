import { useEffect, useState, useCallback } from 'react';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { adminService } from '@/services/adminService';
import { useTranslation } from 'react-i18next';
import SEO from '../../components/Common/SEO';
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

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [users, pendingUpdates, approvedUpdates, rejectedUpdates] = await Promise.all([
        adminService.getUsers().catch(() => []),
        adminService.getCompanyUpdates('pending').catch(() => []),
        adminService.getCompanyUpdates('approved').catch(() => []),
        adminService.getCompanyUpdates('rejected').catch(() => []),
      ]);

      setStats({
        totalUsers: users.length,
        pendingUpdates: pendingUpdates.length,
        approvedUpdates: approvedUpdates.length,
        rejectedUpdates: rejectedUpdates.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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


