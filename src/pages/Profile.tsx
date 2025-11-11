import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import Button from '../components/Common/Button';
import { Message } from 'primereact/message';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import { TabView, TabPanel } from 'primereact/tabview';
import { AUTH_ENDPOINTS, COMPANY_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';
import { useNotification } from '../contexts/NotificationContext';
import { useFavourites } from '../contexts/FavouritesContext';
import { useTranslation } from 'react-i18next';
import SEO from '../components/Common/SEO';
import styles from './Profile.module.scss';
import { useUserNotifications } from '../contexts/UserNotificationsContext';
import type { UserNotification } from '../contexts/UserNotificationsContext';

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
  id?: number;
  user_id?: number;
  name?: string;
  second_name?: string | null;
  username?: string;
  email: string;
  email_verified_at?: string | null;
  role?: string;
  roles?: Array<{
    user_id?: number;
    role_id?: number;
    role_name?: string;
    assigned_at?: string;
  }>;
  createdAt?: string;
  created_at?: string;
  favourites?: Favourite[];
}

interface ProfileFormValues {
  name: string;
  secondName: string;
  email: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { favourites, loading: favouritesLoading, toggleFavourite, initializeFromProfile } = useFavourites();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useUserNotifications();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [favouritesWithCompanies, setFavouritesWithCompanies] = useState<Favourite[]>([]);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    name: '',
    secondName: '',
    email: '',
  });
  const [formError, setFormError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
        setFormValues({
          name: data?.name ?? '',
          secondName: data?.second_name ?? '',
          email: data?.email ?? '',
        });
        
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
    refreshNotifications();
  }, [navigate, initializeFromProfile, refreshNotifications]);

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

  const handleEditToggle = () => {
    if (!profile) return;
    setFormValues({
      name: profile.name ?? '',
      secondName: profile.second_name ?? '',
      email: profile.email ?? '',
    });
    setFormError('');
    setIsEditing(true);
  };

  const handleFormChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancelEdit = () => {
    if (!profile) return;
    setFormValues({
      name: profile.name ?? '',
      secondName: profile.second_name ?? '',
      email: profile.email ?? '',
    });
    setFormError('');
    setIsEditing(false);
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;

    const headers = getAuthHeaders();
    if (!headers) {
      navigate('/login');
      return;
    }

    setSavingProfile(true);
    setFormError('');

    try {
      const response = await fetch(AUTH_ENDPOINTS.PROFILE, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: formValues.name,
          second_name: formValues.secondName,
          email: formValues.email,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.message ||
          (Array.isArray(errorBody?.errors) ? errorBody.errors.join(', ') : null) ||
          'Failed to update profile';
        throw new Error(message);
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setFormValues({
        name: updatedProfile?.name ?? '',
        secondName: updatedProfile?.second_name ?? '',
        email: updatedProfile?.email ?? '',
      });
      showNotification(
        t('profile.profileUpdated', { defaultValue: 'Profile updated successfully' }),
        'success',
      );
      setIsEditing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setFormError(message);
      showNotification(
        t('profile.profileUpdateFailed', { defaultValue: 'Failed to update profile' }),
        'error',
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const success = await markAsRead(notificationId);
      if (!success) {
        showNotification('Failed to mark notification as read', 'error');
      }
    } catch {
      showNotification('Failed to mark notification as read', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const success = await markAllAsRead();
      if (success) {
        showNotification('All notifications marked as read', 'success');
      } else {
        showNotification('Failed to mark all notifications as read', 'error');
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

        <TabView
          className={styles.profileTabs}
          activeIndex={activeTab}
          onTabChange={(e) => setActiveTab(e.index)}
        >
          <TabPanel
            header={t('profile.tabs.overview', { defaultValue: 'Overview' })}
            leftIcon="pi pi-user"
          >
            <div className={styles.tabContent}>
              <Card
                title={
                  <div className={styles.profileHeader}>
                    <span>{t('profile.userInformation')}</span>
                    {!isEditing && (
                      <Button
                        label={t('profile.editProfile', { defaultValue: 'Edit profile' })}
                        onClick={handleEditToggle}
                        size="small"
                        icon="pi pi-pencil"
                      />
                    )}
                  </div>
                }
                className={styles.card}
              >
                <div className={styles.profileInfo}>
                  {isEditing ? (
                    <form className={styles.profileForm} onSubmit={handleProfileSubmit}>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-username">
                          <strong>{t('profile.username', { defaultValue: 'Username' })}</strong>
                        </label>
                        <InputText
                          id="profile-username"
                          value={profile?.username ?? ''}
                          readOnly
                          disabled
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-name">
                          <strong>{t('profile.name')}:</strong>
                        </label>
                        <InputText
                          id="profile-name"
                          name="name"
                          value={formValues.name}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-second-name">
                          <strong>{t('profile.secondName', { defaultValue: 'Second name' })}:</strong>
                        </label>
                        <InputText
                          id="profile-second-name"
                          name="secondName"
                          value={formValues.secondName}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className={styles.formRow}>
                        <label htmlFor="profile-email">
                          <strong>{t('profile.email')}:</strong>
                        </label>
                        <InputText
                          id="profile-email"
                          name="email"
                          type="email"
                          value={formValues.email}
                          onChange={handleFormChange}
                        />
                      </div>
                      {formError && <Message severity="error" text={formError} />}
                      <div className={styles.formActions}>
                        <Button
                          type="button"
                          label={t('common.cancel', { defaultValue: 'Cancel' })}
                          variant="text"
                          onClick={handleCancelEdit}
                          disabled={savingProfile}
                          icon="pi pi-times"
                        />
                        <Button
                          type="submit"
                          label={t('common.save', { defaultValue: 'Save' })}
                          loading={savingProfile}
                          disabled={savingProfile}
                          icon="pi pi-check"
                        />
                      </div>
                    </form>
                  ) : (
                    <>
                      {profile?.id && (
                        <p>
                          <strong>{t('profile.userId')}:</strong> {profile.id}
                        </p>
                      )}
                      {profile?.user_id && profile.user_id !== profile.id && (
                        <p>
                          <strong>{t('profile.userId')}:</strong> {profile.user_id}
                        </p>
                      )}
                      {profile?.username && (
                        <p>
                          <strong>{t('profile.username', { defaultValue: 'Username' })}:</strong>{' '}
                          {profile.username}
                        </p>
                      )}
                      {profile?.name && (
                        <p>
                          <strong>{t('profile.name')}:</strong> {profile.name}
                        </p>
                      )}
                      {profile?.second_name && (
                        <p>
                          <strong>{t('profile.secondName', { defaultValue: 'Second name' })}:</strong>{' '}
                          {profile.second_name}
                        </p>
                      )}
                      <p>
                        <strong>{t('profile.email')}:</strong>{' '}
                        {profile?.email ||
                          t('profile.emailNotProvided', { defaultValue: 'Not provided' })}
                      </p>
                      <p>
                        <strong>{t('profile.role')}:</strong>{' '}
                        {profile?.role ||
                          (Array.isArray(profile?.roles) && profile.roles.length > 0
                            ? profile.roles
                                .map((roleItem) => roleItem?.role_name ?? '')
                                .filter(Boolean)
                                .join(', ')
                            : t('profile.roleUnknown', { defaultValue: 'Unknown' }))}
                      </p>
                      <p>
                        <strong>{t('profile.memberSince')}:</strong>{' '}
                        {profile?.createdAt || profile?.created_at
                          ? new Date(profile.createdAt ?? profile.created_at ?? '').toLocaleDateString()
                          : 'N/A'}
                      </p>
                      <p>
                        <strong>{t('profile.emailVerified', { defaultValue: 'Email verified' })}:</strong>{' '}
                        {profile?.email_verified_at
                          ? new Date(profile.email_verified_at).toLocaleString()
                          : t('profile.notVerified', { defaultValue: 'Not verified' })}
                      </p>
                    </>
                  )}
                </div>
              </Card>

              <Card title={t('profile.resume')} className={styles.card}>
                <div className={styles.resumeSection}>
                  <FileUpload
                    mode="basic"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    maxFileSize={5000000}
                    auto
                    chooseLabel={t('profile.uploadResume')}
                    onUpload={() => {
                      showNotification(t('profile.resumeUploaded'), 'success');
                    }}
                    onError={() => {
                      showNotification(t('profile.resumeUploadError'), 'error');
                    }}
                    className={styles.resumeUpload}
                  />
                  <p className={styles.resumeHint}>{t('profile.resumeHint')}</p>
                </div>
              </Card>
            </div>
          </TabPanel>

          <TabPanel
            header={t('profile.tabs.favourites', { defaultValue: 'Favourites' })}
            leftIcon="pi pi-heart"
          >
            <div className={styles.tabContent}>
              <Card title={t('favourites.title')} className={styles.card}>
                {favouritesLoading || loadingCompanyDetails ? (
                  <div className={styles.loadingContainer}>
                    <ProgressSpinner />
                  </div>
                ) : favourites.length === 0 ? (
                  <p className={styles.emptyMessage}>{t('favourites.noFavourites')}</p>
                ) : (
                  <div className={styles.favouritesList}>
                    {(favouritesWithCompanies.length > 0 ? favouritesWithCompanies : favourites).map(
                      (favourite) => (
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
                      ),
                    )}
                  </div>
                )}
              </Card>
            </div>
          </TabPanel>

          <TabPanel
            header={t('profile.tabs.notifications', { defaultValue: 'Notifications' })}
            leftIcon="pi pi-bell"
          >
            <div className={styles.tabContent}>
              <Card
                title={
                  <div className={styles.notificationsHeader}>
                    <span>{t('notifications.title')}</span>
                    {unreadCount > 0 && <Badge value={unreadCount} severity="danger" />}
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
                      icon="pi pi-check"
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
                    {notifications.map((notification: UserNotification) => (
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
                          {notification.title && notification.title !== notification.message && (
                            <p className={styles.notificationTitle}>{notification.title}</p>
                          )}
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
            </div>
          </TabPanel>
        </TabView>
        <Button
          label="Logout"
          onClick={handleLogout}
          severity="secondary"
          className={styles.logoutButton}
          icon="pi pi-sign-out"
        />
    </div>
    </>
  );
};

export default Profile; 