import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AUTH_ENDPOINTS, NOTIFICATIONS_ENDPOINTS, COMPANY_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';
import { useNotification } from '../contexts/NotificationContext';
import { useFavourites } from '../contexts/FavouritesContext';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import styles from './Profile.module.scss';

interface Favourite {
  id: number;
  company_id: number;
  company?: {
    id: number;
    name: string;
    mainbusinesslinename?: string | null;
  };
}

interface UserProfile {
  email: string;
  role: string;
  createdAt: string;
  favourites?: Favourite[];
}

interface Notification {
  id: number;
  user_id: number;
  company_id: number;
  notification_type: string;
  message: string;
  read: boolean;
  created_at: string;
  company?: {
    id: number;
    name: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { favourites, loading: favouritesLoading, toggleFavourite, initializeFromProfile } = useFavourites();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [favouritesWithCompanies, setFavouritesWithCompanies] = useState<Favourite[]>([]);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const headers = getAuthHeaders();
        if (!headers) {
          navigate('/login');
          return;
        }

        const response = await fetch(AUTH_ENDPOINTS.PROFILE, {
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
        
        // Extract favourites from profile and initialize in context
        // Handle both direct array and wrapped in data property
        let favouritesArray: Favourite[] = [];
        if (data.favourites) {
          if (Array.isArray(data.favourites)) {
            favouritesArray = data.favourites;
          } else if (Array.isArray(data.favourites?.data)) {
            favouritesArray = data.favourites.data;
          }
        }
        initializeFromProfile(favouritesArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchNotifications();
    fetchUnreadCount();
  }, [navigate, initializeFromProfile]);

  // Fetch company details for favourites when favourites change
  useEffect(() => {
    const fetchCompanyDetailsForFavourites = async () => {
      if (favourites.length === 0) {
        setFavouritesWithCompanies([]);
        return;
      }

      // Filter favourites that don't have company data
      const favouritesNeedingData = favourites.filter(fav => !fav.company);
      
      if (favouritesNeedingData.length === 0) {
        // All favourites already have company data
        setFavouritesWithCompanies(favourites);
        return;
      }

      setLoadingCompanyDetails(true);
      try {
        const headers = getAuthHeaders();
        if (!headers) {
          return;
        }

        // Fetch company details for each favourite that needs it
        const companyPromises = favouritesNeedingData.map(async (favourite) => {
          try {
            const response = await fetch(COMPANY_ENDPOINTS.DETAILS(favourite.company_id.toString()), {
              headers,
            });

            if (response.ok) {
              const data = await response.json();
              // Company endpoint returns array, get first item
              const companyData = Array.isArray(data) ? data[0] : data;
              
              if (companyData) {
                return {
                  ...favourite,
                  company: {
                    id: companyData.id,
                    name: companyData.name,
                    mainbusinesslinename: companyData.mainbusinesslinename || null,
                  },
                };
              }
            }
          } catch (err) {
            console.error(`Failed to fetch company ${favourite.company_id}:`, err);
          }
          // Return favourite without company data if fetch failed
          return favourite;
        });

        const favouritesWithCompanyData = await Promise.all(companyPromises);
        
        // Merge with favourites that already have company data
        const allFavouritesWithCompanies = favourites.map(fav => {
          const updated = favouritesWithCompanyData.find(f => f.id === fav.id);
          return updated || fav;
        });

        setFavouritesWithCompanies(allFavouritesWithCompanies);
      } catch (err) {
        console.error('Error fetching company details for favourites:', err);
        // Fallback to favourites without company data
        setFavouritesWithCompanies(favourites);
      } finally {
        setLoadingCompanyDetails(false);
      }
    };

    fetchCompanyDetailsForFavourites();
  }, [favourites]);

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const headers = getAuthHeaders();
      if (!headers) {
        return;
      }

      const response = await fetch(NOTIFICATIONS_ENDPOINTS.LIST, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch {
      // Silent fail
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        return;
      }

      const response = await fetch(NOTIFICATIONS_ENDPOINTS.UNREAD_COUNT, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(typeof data.count === 'number' ? data.count : 0);
      }
    } catch {
      // Silent fail
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        return;
      }

      const response = await fetch(NOTIFICATIONS_ENDPOINTS.MARK_READ(notificationId), {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      showNotification('Failed to mark notification as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        return;
      }

      const response = await fetch(NOTIFICATIONS_ENDPOINTS.MARK_ALL_READ, {
        method: 'PUT',
        headers,
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
        setUnreadCount(0);
        showNotification('All notifications marked as read', 'success');
      }
    } catch {
      showNotification('Failed to mark all notifications as read', 'error');
    }
  };

  const handleRemoveFavourite = async (companyId: number) => {
    try {
      const success = await toggleFavourite(companyId);
      if (success) {
        showNotification(t('favourites.removedFromFavourites'), 'success');
      } else {
        showNotification('Failed to remove favourite', 'error');
      }
    } catch {
      showNotification('Failed to remove favourite', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (loading) {
    return (
      <>
        <SEO
          title={`${t('navigation.profile')} - ${t('app.title')}`}
          description="View your profile, favourites, and notifications"
          url={currentUrl}
          noindex={true}
        />
        <div className={styles.container}>
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title={`${t('navigation.profile')} - ${t('app.title')}`}
          description="View your profile"
          url={currentUrl}
          noindex={true}
        />
        <div className={styles.container}>
          <Message severity="error" text={error} />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${t('navigation.profile')} - ${t('app.title')}`}
        description="View your profile, manage your favourite companies, and check notifications"
        url={currentUrl}
        noindex={true}
      />
      <div className={styles.container}>
      <h1 className={styles.title}>{t('navigation.profile')}</h1>
      
      <Card title={t('profile.userInformation')} className={styles.card}>
        <div className={styles.profileInfo}>
          <p>
            <strong>{t('profile.email')}:</strong> {profile?.email}
          </p>
          <p>
            <strong>{t('profile.role')}:</strong> {profile?.role}
          </p>
          <p>
            <strong>{t('profile.memberSince')}:</strong>{' '}
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
      </Card>

      <Card title={t('favourites.title')} className={styles.card}>
        {favouritesLoading || loadingCompanyDetails ? (
          <div className={styles.loadingContainer}>
            <ProgressSpinner />
          </div>
        ) : favourites.length === 0 ? (
          <p className={styles.emptyMessage}>{t('favourites.noFavourites')}</p>
        ) : (
          <div className={styles.favouritesList}>
            {(favouritesWithCompanies.length > 0 ? favouritesWithCompanies : favourites).map((favourite) => (
              <div key={favourite.id} className={styles.favouriteItem}>
                <div className={styles.favouriteInfo}>
                  <h4
                    className={styles.favouriteCompanyName}
                    onClick={() => navigate(`/companies/${favourite.company_id}`)}
                  >
                    {favourite.company?.name || `Company ID: ${favourite.company_id}`}
                  </h4>
                  {favourite.company?.mainbusinesslinename && (
                    <p className={styles.favouriteCategory}>
                      {favourite.company.mainbusinesslinename}
                    </p>
                  )}
                </div>
                <Button
                  icon="pi pi-times"
                  onClick={() => handleRemoveFavourite(favourite.company_id)}
                  severity="secondary"
                  text
                  rounded
                  aria-label={t('favourites.removeFromFavourites')}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card 
        title={
          <div className={styles.notificationsHeader}>
            <span>{t('notifications.title')}</span>
            {unreadCount > 0 && (
              <Badge value={unreadCount} severity="danger" />
            )}
          </div>
        }
        className={styles.card}
      >
        {unreadCount > 0 && (
          <div className={styles.markAllContainer}>
            <Button
              label={t('notifications.markAllAsRead')}
              onClick={handleMarkAllAsRead}
              severity="secondary"
              size="small"
              text
            />
          </div>
        )}
        {notificationsLoading ? (
          <div className={styles.loadingContainer}>
            <ProgressSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <p className={styles.emptyMessage}>{t('notifications.noNotifications')}</p>
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${
                  !notification.read ? styles.unread : ''
                }`}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h4
                      className={styles.notificationCompany}
                      onClick={() => navigate(`/companies/${notification.company_id}`)}
                    >
                      {notification.company?.name || `Company ID: ${notification.company_id}`}
                    </h4>
                    {!notification.read && (
                      <Badge value={t('notifications.unread')} severity="info" />
                    )}
                  </div>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <p className={styles.notificationTime}>
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <Button
                    icon="pi pi-check"
                    onClick={() => handleMarkAsRead(notification.id)}
                    severity="success"
                    text
                    rounded
                    aria-label={t('notifications.markAsRead')}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Button
        label="Logout"
        onClick={handleLogout}
        severity="secondary"
        className={styles.logoutButton}
      />
    </div>
    </>
  );
};

export default Profile; 