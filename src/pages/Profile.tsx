import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Common/Button';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { FileUpload } from 'primereact/fileupload';
import { InputText } from 'primereact/inputtext';
import {
  AutoComplete,
  AutoCompleteChangeEvent,
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
} from 'primereact/autocomplete';
import { AUTH_ENDPOINTS, COMPANY_ENDPOINTS, SKILL_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';
import { useNotification } from '../contexts/NotificationContext';
import { useFavourites } from '../contexts/FavouritesContext';
import { useTranslation } from 'react-i18next';
import SEO from '../components/Common/SEO';
import styles from './Profile.module.scss';
import { useUserNotifications } from '../contexts/UserNotificationsContext';
import type { UserNotification } from '../contexts/UserNotificationsContext';
import SkillLevelSelector from '../components/Profile/SkillLevelSelector';
import SkillScaleTabs from '../components/Profile/SkillScaleTabs';
import {
  SkillLevel,
  SkillScaleType,
  SKILL_LEVELS,
  SKILL_SCALES,
  detectScaleFromLevel,
  getSkillLevelHint,
} from '../components/Profile/skillConstants';
import { useAuth } from '@/hooks/useAuth';

interface Favourite {
  id: number;
  company_id: number;
  company?: {
    id: number;
    name: string;
    mainbusinesslinename?: string | null;
  };
}

interface UserSkill {
  id?: number;
  name: string;
  level: SkillLevel;
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
  skills?: UserSkill[];
}

const isSkillLevel = (value: unknown): value is SkillLevel =>
  typeof value === 'string' && (SKILL_LEVELS as readonly string[]).includes(value);

const sanitizeSkills = (input: unknown): UserSkill[] => {
  if (!Array.isArray(input)) {
    return [];
  }
  return input
    .filter(
      (item): item is { id?: number; name: string; level?: unknown } =>
        typeof item === 'object' &&
        item !== null &&
        'name' in item &&
        typeof (item as { name?: unknown }).name === 'string',
    )
    .map((item) => ({
      id: typeof item.id === 'number' ? item.id : undefined,
      name: (item as { name: string }).name,
      level: isSkillLevel(item.level) ? item.level : ('3' as SkillLevel),
    }));
};

interface ProfileFormValues {
  name: string;
  secondName: string;
  email: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [skillsDraft, setSkillsDraft] = useState<UserSkill[]>([]);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('3');
  const [availableSkillsLoading, setAvailableSkillsLoading] = useState(false);
  const [savingSkills, setSavingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState('');
  const [skillsFetchError, setSkillsFetchError] = useState('');

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
        const sanitizedSkills = sanitizeSkills(data?.skills);
        setSkills(sanitizedSkills);
        setSkillsDraft(sanitizedSkills);
        
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
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    refreshNotifications();
  }, [navigate, initializeFromProfile, refreshNotifications, logout]);

  useEffect(() => {
    const fetchAvailableSkills = async () => {
      const headers = getAuthHeaders();
      if (!headers) {
        return;
      }
      setAvailableSkillsLoading(true);
      setSkillsFetchError('');
      try {
        const response = await fetch(SKILL_ENDPOINTS.LIST, {
          headers,
        });
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        const data = await response.json();
        const extractNames = (items: unknown): string[] => {
          if (!Array.isArray(items)) {
            return [];
          }
          return items
            .map((item) => {
              if (typeof item === 'string') {
                return item;
              }
              if (item && typeof item === 'object' && 'name' in item && typeof (item as { name?: unknown }).name === 'string') {
                return (item as { name: string }).name;
              }
              return null;
            })
            .filter((name): name is string => !!name && name.trim().length > 0);
        };
        const namesFromRoot = extractNames(data);
        const namesFromData = extractNames((data as { data?: unknown })?.data);
        const combined = [...namesFromRoot, ...namesFromData];
        const unique = Array.from(new Set(combined.map((name) => name.trim()))).filter((name) => name.length > 0);
        setAvailableSkills(unique);
      } catch (err) {
        console.error('Failed to fetch available skills:', err);
        setSkillsFetchError(
          t('profile.skills.fetchError', { defaultValue: 'Failed to load available skills' }),
        );
      } finally {
        setAvailableSkillsLoading(false);
      }
    };

    fetchAvailableSkills();
  }, [t]);

  const normalizeSkillName = (name: string) => name.trim().toLowerCase();

  const handleSkillSearch = (event: AutoCompleteCompleteEvent) => {
    const query = event.query.trim().toLowerCase();
    const filtered = availableSkills.filter((skillName) => {
      const normalized = normalizeSkillName(skillName);
      if (skillsDraft.some((skill) => normalizeSkillName(skill.name) === normalized)) {
        return false;
      }
      return query.length === 0 || normalized.includes(query);
    });
    setSkillSuggestions(filtered.slice(0, 10));
  };

  const handleSkillInputChange = (event: AutoCompleteChangeEvent) => {
    const value = typeof event.value === 'string' ? event.value : '';
    setNewSkillName(value);
    if (value) {
      const lower = value.trim().toLowerCase();
      const isLanguage = /^(english|английский|suomi|финский|swedish|шведский|russian|русский|german|немецкий|french|французский|spanish|испанский|ukrainian|украинский|язык|language|kieli|språk)/i.test(lower);
      if (isLanguage && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(newSkillLevel)) {
        setNewSkillLevel('B1');
      }
    }
  };

  const handleSkillSelect = (event: AutoCompleteSelectEvent) => {
    const value = typeof event.value === 'string' ? event.value : '';
    setNewSkillName(value);
    if (value) {
      const lower = value.trim().toLowerCase();
      const isLanguage = /^(english|английский|suomi|финский|swedish|шведский|russian|русский|german|немецкий|french|французский|spanish|испанский|ukrainian|украинский|язык|language|kieli|språk)/i.test(lower);
      if (isLanguage && !['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(newSkillLevel)) {
        setNewSkillLevel('B1');
      }
    }
  };

  const activeScale = useMemo(() => detectScaleFromLevel(newSkillLevel), [newSkillLevel]);
  const currentSkillHint = useMemo(() => getSkillLevelHint(newSkillLevel), [newSkillLevel]);

  const handleScaleTabChange = (scale: SkillScaleType) => {
    const options = SKILL_SCALES[scale].options;
    const defaultIdx = Math.floor(options.length / 2);
    setNewSkillLevel(options[defaultIdx].value);
  };

  const handleAddSkill = () => {
    if (savingSkills) {
      return;
    }
    const trimmedName = newSkillName.trim();
    if (!trimmedName) {
      setSkillsError(t('profile.skills.nameRequired', { defaultValue: 'Skill name is required' }));
      return;
    }
    const normalizedName = normalizeSkillName(trimmedName);
    if (skillsDraft.some((skill) => normalizeSkillName(skill.name) === normalizedName)) {
      setSkillsError(
        t('profile.skills.duplicateError', { defaultValue: 'You already added this skill' }),
      );
      return;
    }
    const selectedLevel = isSkillLevel(newSkillLevel)
      ? newSkillLevel
      : ('3' as SkillLevel);
    const nextSkills = [
      ...skillsDraft,
      {
        name: trimmedName,
        level: selectedLevel,
      },
    ];
    setSkillsDraft(nextSkills);
    setNewSkillName('');
    setNewSkillLevel('3');
    setSkillSuggestions([]);
    setSkillsError('');
  };

  const handleSkillLevelChange = (index: number, level: SkillLevel) => {
    if (savingSkills) {
      return;
    }
    setSkillsDraft((prev) =>
      prev.map((skill, idx) => {
        if (idx !== index) {
          return skill;
        }
        return {
          ...skill,
          level,
        };
      }),
    );
  };

  const handleSkillRemove = (index: number) => {
    if (savingSkills) {
      return;
    }
    setSkillsDraft((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSkillsEditToggle = () => {
    if (!profile) {
      return;
    }
    setSkillsDraft(skills);
    setIsEditingSkills(true);
    setSkillsError('');
  };

  const handleSkillsCancel = () => {
    setSkillsDraft(skills);
    setIsEditingSkills(false);
    setSkillsError('');
    setNewSkillName('');
    setNewSkillLevel('3');
  };

  const handleSkillsSave = async () => {
    if (!profile) {
      return;
    }
    const headers = getAuthHeaders();
    if (!headers) {
      navigate('/login');
      return;
    }
    setSavingSkills(true);
    setSkillsError('');
    try {
      const response = await fetch(AUTH_ENDPOINTS.PROFILE, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: formValues.name,
          second_name: formValues.secondName,
          email: formValues.email,
          skills: skillsDraft.map((skill) => ({
            id: skill.id,
            name: skill.name,
            level: skill.level,
          })),
        }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message =
          errorBody?.message ||
          (Array.isArray(errorBody?.errors) ? errorBody.errors.join(', ') : null) ||
          t('profile.skills.saveError', { defaultValue: 'Failed to update skills' });
        throw new Error(message);
      }
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      const sanitizedSkills = sanitizeSkills(updatedProfile?.skills);
      setSkills(sanitizedSkills);
      setSkillsDraft(sanitizedSkills);
      showNotification(
        t('profile.skills.saveSuccess', { defaultValue: 'Skills updated successfully' }),
        'success',
      );
      setIsEditingSkills(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : undefined;
      setSkillsError(
        message ||
          t('profile.skills.saveError', { defaultValue: 'Failed to update skills' }),
      );
      showNotification(
        t('profile.skills.saveError', { defaultValue: 'Failed to update skills' }),
        'error',
      );
    } finally {
      setSavingSkills(false);
    }
  };

  // Fetch company details for favourites when favourites change
  useEffect(() => {
    const fetchCompanyDetailsForFavourites = async () => {
      if (favourites.length === 0) {
        setFavouritesWithCompanies([]);
        return;
      }

      const favouritesNeedingData = favourites.filter((fav) => !fav.company);

      if (favouritesNeedingData.length === 0) {
        setFavouritesWithCompanies(favourites);
        return;
      }

      setLoadingCompanyDetails(true);
      try {
        const headers = getAuthHeaders();
        if (!headers) {
          return;
        }

        const companyPromises = favouritesNeedingData.map(async (favourite) => {
          try {
            const response = await fetch(COMPANY_ENDPOINTS.DETAILS(favourite.company_id.toString()), {
              headers,
            });

            if (response.ok) {
              const data = await response.json();
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
          return favourite;
        });

        const favouritesWithCompanyData = await Promise.all(companyPromises);

        const allFavouritesWithCompanies = favourites.map((fav) => {
          const updated = favouritesWithCompanyData.find((f) => f.id === fav.id);
          return updated || fav;
        });

        setFavouritesWithCompanies(allFavouritesWithCompanies);
      } catch (err) {
        console.error('Failed to fetch company details for favourites:', err);
      } finally {
        setLoadingCompanyDetails(false);
      }
    };

    fetchCompanyDetailsForFavourites();
  }, [favourites]);

  const handleEditToggle = () => {
    if (!profile) return;
    setIsEditing(true);
    setFormError('');
    setFormValues({
      name: profile?.name ?? '',
      secondName: profile?.second_name ?? '',
      email: profile?.email ?? '',
    });
  };

  const handleCancelEdit = () => {
    if (!profile) return;
    setIsEditing(false);
    setFormError('');
    setFormValues({
      name: profile?.name ?? '',
      secondName: profile?.second_name ?? '',
      email: profile?.email ?? '',
    });
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formValues.name.trim()) {
      setFormError(t('profile.nameRequired', { defaultValue: 'Name is required' }));
      return;
    }

    if (!formValues.email.trim()) {
      setFormError(t('profile.emailRequired', { defaultValue: 'Email is required' }));
      return;
    }

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
          skills: skills.map((skill) => ({
            id: skill.id,
            name: skill.name,
            level: skill.level,
          })),
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
      const updatedSkills = sanitizeSkills(updatedProfile?.skills);
      setSkills(updatedSkills);
      setSkillsDraft(updatedSkills);
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
    logout();
    navigate('/login');
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const getInitials = (name?: string, secondName?: string | null, username?: string) => {
    if (name && secondName) {
      return `${name[0]}${secondName[0]}`.toUpperCase();
    }
    if (name && name.length >= 2) {
      return name.slice(0, 2).toUpperCase();
    }
    if (username && username.length >= 2) {
      return username.slice(0, 2).toUpperCase();
    }
    return (name?.[0] || username?.[0] || 'U').toUpperCase();
  };

  const userDisplayName =
    profile?.name ? `${profile.name} ${profile.second_name || ''}`.trim() : (profile?.username || 'User');

  const userRole =
    profile?.role ||
    (Array.isArray(profile?.roles) && profile.roles.length > 0
      ? profile.roles
          .map((r) => r?.role_name ?? '')
          .filter(Boolean)
          .join(', ')
      : 'User');

  const formatSkillBadge = (level: string) => {
    if (['1', '2', '3', '4', '5'].includes(level)) {
      return t('profile.skills.levelFormat', { level, defaultValue: `Уровень ${level}` });
    }
    return level;
  };

  const memberSinceFormatted =
    profile?.createdAt || profile?.created_at
      ? new Date(profile.createdAt ?? profile.created_at ?? '').toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Recently';

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
          <div className={styles.loadingWrapper}>
            <ProgressSpinner strokeWidth="4" />
            <p className={styles.loadingText}>{t('common.loading', { defaultValue: 'Loading your profile...' })}</p>
          </div>
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
          <div className={styles.errorCard}>
            <i className={`pi pi-exclamation-triangle ${styles.errorIcon}`} />
            <h2>{t('common.error', { defaultValue: 'Something went wrong' })}</h2>
            <p>{error}</p>
            <Button
              label={t('navigation.login', { defaultValue: 'Go to Login' })}
              onClick={() => navigate('/login')}
              icon="pi pi-arrow-left"
            />
          </div>
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
        {/* Hero Card */}
        <section className={styles.heroCard}>
          <div className={styles.heroMain}>
            <div className={styles.avatar}>
              <span>{getInitials(profile?.name, profile?.second_name, profile?.username)}</span>
            </div>
            <div className={styles.heroDetails}>
              <div className={styles.heroNameRow}>
                <h1 className={styles.heroName}>{userDisplayName}</h1>
                <span className={styles.roleBadge}>{userRole}</span>
              </div>
              <div className={styles.heroMetaRow}>
                {profile?.username && (
                  <span className={styles.metaHandle}>@{profile.username}</span>
                )}
                <span className={styles.metaDot}>•</span>
                <span className={styles.metaEmail}>
                  <i className="pi pi-envelope" />
                  {profile?.email}
                </span>
                <span className={styles.metaDot}>•</span>
                <span className={styles.metaJoined}>
                  <i className="pi pi-calendar" />
                  {t('profile.memberSince', { defaultValue: 'Member since' })} {memberSinceFormatted}
                </span>
              </div>
              <div className={styles.heroBadgesRow}>
                {profile?.email_verified_at ? (
                  <span className={`${styles.statusChip} ${styles.verified}`}>
                    <i className="pi pi-verified" />
                    {t('profile.emailVerified', { defaultValue: 'Email verified' })}
                  </span>
                ) : (
                  <span className={`${styles.statusChip} ${styles.unverified}`}>
                    <i className="pi pi-exclamation-circle" />
                    {t('profile.notVerified', { defaultValue: 'Email not verified' })}
                  </span>
                )}
                {profile?.id && (
                  <span className={styles.idChip}>ID: #{profile.id}</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Button
              label={isEditing ? t('common.cancel', { defaultValue: 'Cancel' }) : t('profile.editProfile', { defaultValue: 'Edit Profile' })}
              onClick={() => {
                if (isEditing) {
                  handleCancelEdit();
                } else {
                  setActiveTab(0);
                  handleEditToggle();
                }
              }}
              variant={isEditing ? 'outlined' : 'filled'}
              icon={isEditing ? 'pi pi-times' : 'pi pi-pencil'}
              className={styles.heroEditBtn}
            />
            <Button
              label={t('navigation.logout', { defaultValue: 'Logout' })}
              onClick={handleLogout}
              variant="outlined"
              icon="pi pi-sign-out"
              className={styles.heroLogoutBtn}
            />
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className={styles.navTabs} role="tablist" aria-label="Profile Sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 0}
            className={`${styles.navTab} ${activeTab === 0 ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab(0)}
          >
            <i className="pi pi-user" />
            <span>{t('profile.tabs.overview', { defaultValue: 'Overview' })}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 1}
            className={`${styles.navTab} ${activeTab === 1 ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab(1)}
          >
            <i className="pi pi-bolt" />
            <span>{t('profile.skills.title', { defaultValue: 'Skills' })}</span>
            {skills.length > 0 && <span className={styles.tabCounter}>{skills.length}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 2}
            className={`${styles.navTab} ${activeTab === 2 ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab(2)}
          >
            <i className="pi pi-heart" />
            <span>{t('profile.tabs.favourites', { defaultValue: 'Favourites' })}</span>
            {favourites.length > 0 && <span className={styles.tabCounter}>{favourites.length}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 3}
            className={`${styles.navTab} ${activeTab === 3 ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab(3)}
          >
            <i className="pi pi-bell" />
            <span>{t('profile.tabs.notifications', { defaultValue: 'Notifications' })}</span>
            {unreadCount > 0 && <span className={`${styles.tabCounter} ${styles.unreadCounter}`}>{unreadCount}</span>}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 4}
            className={`${styles.navTab} ${activeTab === 4 ? styles.navTabActive : ''}`}
            onClick={() => setActiveTab(4)}
          >
            <i className="pi pi-file" />
            <span>{t('profile.resume', { defaultValue: 'Resume & CV' })}</span>
          </button>
        </nav>

        {/* Tab Content Container */}
        <div className={styles.tabPanels}>
          {/* TAB 0: OVERVIEW */}
          {activeTab === 0 && (
            <div className={styles.panelAnimated}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderTitle}>
                    <i className="pi pi-id-card" />
                    <h3>{t('profile.userInformation', { defaultValue: 'Personal Information' })}</h3>
                  </div>
                  {!isEditing && (
                    <Button
                      label={t('profile.editProfile', { defaultValue: 'Edit' })}
                      onClick={handleEditToggle}
                      size="small"
                      icon="pi pi-pencil"
                      variant="outlined"
                    />
                  )}
                </div>

                <div className={styles.cardBody}>
                  {isEditing ? (
                    <form className={styles.profileForm} onSubmit={handleProfileSubmit}>
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label htmlFor="profile-username">
                            {t('profile.username', { defaultValue: 'Username' })}
                          </label>
                          <InputText
                            id="profile-username"
                            value={profile?.username ?? ''}
                            readOnly
                            disabled
                            className={styles.inputDisabled}
                          />
                          <span className={styles.inputHelp}>
                            {t('profile.usernameNotice', { defaultValue: 'Username cannot be changed' })}
                          </span>
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="profile-email">
                            {t('profile.email', { defaultValue: 'Email address' })} *
                          </label>
                          <InputText
                            id="profile-email"
                            name="email"
                            type="email"
                            value={formValues.email}
                            onChange={handleFormChange}
                            required
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="profile-name">
                            {t('profile.name', { defaultValue: 'First name' })} *
                          </label>
                          <InputText
                            id="profile-name"
                            name="name"
                            value={formValues.name}
                            onChange={handleFormChange}
                            required
                            className={styles.input}
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label htmlFor="profile-second-name">
                            {t('profile.secondName', { defaultValue: 'Last name' })}
                          </label>
                          <InputText
                            id="profile-second-name"
                            name="secondName"
                            value={formValues.secondName}
                            onChange={handleFormChange}
                            className={styles.input}
                          />
                        </div>
                      </div>

                      {formError && (
                        <Message severity="error" text={formError} className={styles.formErrorMsg} />
                      )}

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
                          label={savingProfile ? t('common.saving', { defaultValue: 'Saving...' }) : t('common.save', { defaultValue: 'Save Changes' })}
                          loading={savingProfile}
                          disabled={savingProfile}
                          icon="pi pi-check"
                          className={styles.saveBtn}
                        />
                      </div>
                    </form>
                  ) : (
                    <div className={styles.infoGrid}>
                      <div className={styles.infoTile}>
                        <div className={styles.infoIconWrap}>
                          <i className="pi pi-at" />
                        </div>
                        <div className={styles.infoTexts}>
                          <span className={styles.infoLabel}>{t('profile.username', { defaultValue: 'Username' })}</span>
                          <span className={styles.infoValue}>{profile?.username || '—'}</span>
                        </div>
                      </div>

                      <div className={styles.infoTile}>
                        <div className={styles.infoIconWrap}>
                          <i className="pi pi-user" />
                        </div>
                        <div className={styles.infoTexts}>
                          <span className={styles.infoLabel}>{t('profile.fullName', { defaultValue: 'Full Name' })}</span>
                          <span className={styles.infoValue}>{userDisplayName}</span>
                        </div>
                      </div>

                      <div className={styles.infoTile}>
                        <div className={styles.infoIconWrap}>
                          <i className="pi pi-envelope" />
                        </div>
                        <div className={styles.infoTexts}>
                          <span className={styles.infoLabel}>{t('profile.email', { defaultValue: 'Email' })}</span>
                          <span className={styles.infoValue}>{profile?.email || '—'}</span>
                        </div>
                      </div>

                      <div className={styles.infoTile}>
                        <div className={styles.infoIconWrap}>
                          <i className="pi pi-shield" />
                        </div>
                        <div className={styles.infoTexts}>
                          <span className={styles.infoLabel}>{t('profile.role', { defaultValue: 'Role' })}</span>
                          <span className={styles.infoValue}>{userRole}</span>
                        </div>
                      </div>

                      <div className={styles.infoTile}>
                        <div className={styles.infoIconWrap}>
                          <i className="pi pi-hashtag" />
                        </div>
                        <div className={styles.infoTexts}>
                          <span className={styles.infoLabel}>{t('profile.userId', { defaultValue: 'Account ID' })}</span>
                          <span className={styles.infoValue}>#{profile?.id || profile?.user_id || '—'}</span>
                        </div>
                      </div>

                      <div className={styles.infoTile}>
                        <div className={styles.infoIconWrap}>
                          <i className="pi pi-calendar" />
                        </div>
                        <div className={styles.infoTexts}>
                          <span className={styles.infoLabel}>{t('profile.memberSince', { defaultValue: 'Registration Date' })}</span>
                          <span className={styles.infoValue}>{memberSinceFormatted}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: SKILLS */}
          {activeTab === 1 && (
            <div className={styles.panelAnimated}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderTitle}>
                    <i className="pi pi-bolt" />
                    <div>
                      <h3>{t('profile.skills.title', { defaultValue: 'Skills & Competencies' })}</h3>
                      <p className={styles.cardSubtitle}>
                        {t('profile.skills.description', {
                          defaultValue: 'Track your professional and language proficiencies on the CEFR scale.',
                        })}
                      </p>
                    </div>
                  </div>
                  {!isEditingSkills ? (
                    <Button
                      label={t('profile.skills.edit', { defaultValue: 'Manage Skills' })}
                      icon="pi pi-pencil"
                      size="small"
                      onClick={handleSkillsEditToggle}
                      disabled={savingSkills}
                      variant="outlined"
                    />
                  ) : (
                    <div className={styles.headerBtnGroup}>
                      <Button
                        type="button"
                        label={t('common.cancel', { defaultValue: 'Cancel' })}
                        variant="text"
                        onClick={handleSkillsCancel}
                        disabled={savingSkills}
                        icon="pi pi-times"
                      />
                      <Button
                        type="button"
                        label={t('profile.skills.save', { defaultValue: 'Save Changes' })}
                        onClick={handleSkillsSave}
                        loading={savingSkills}
                        disabled={savingSkills}
                        icon="pi pi-check"
                        className={styles.saveBtn}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.cardBody}>
                  {skillsFetchError && (
                    <Message severity="warn" text={skillsFetchError} className={styles.skillsMessage} />
                  )}

                  {isEditingSkills ? (
                    <div className={styles.skillsEditor}>
                      {/* Add new skill bar */}
                      <div className={styles.addSkillCard}>
                        <h4 className={styles.addSkillHeading}>
                          <i className="pi pi-plus-circle" />
                          {t('profile.skills.addNew', { defaultValue: 'Add a new skill' })}
                        </h4>
                        <div className={styles.addSkillForm}>
                          <div className={styles.addSkillFormTop}>
                            <label className={styles.inputFieldLabel}>
                              <i className="pi pi-tag" />
                              {t('profile.skills.nameLabel', { defaultValue: 'Skill or Profession' })}
                            </label>
                            <div className={styles.scaleTabsWrapper}>
                              <span className={styles.scaleTabsLabel}>
                                {t('profile.skills.scaleLabel', { defaultValue: 'Scale:' })}
                              </span>
                              <SkillScaleTabs
                                activeScale={activeScale}
                                onChange={handleScaleTabChange}
                              />
                            </div>
                          </div>

                          <div className={styles.addSkillFormMain}>
                            <div className={styles.autocompleteWrapper}>
                              <AutoComplete
                                value={newSkillName}
                                suggestions={skillSuggestions}
                                completeMethod={handleSkillSearch}
                                onChange={handleSkillInputChange}
                                onSelect={handleSkillSelect}
                                placeholder={t('profile.skills.addPlaceholder', {
                                  defaultValue: 'Search or enter skill (e.g. Welding, React, English)...',
                                })}
                                dropdown
                                disabled={savingSkills}
                                className={styles.skillAutoComplete}
                              />
                            </div>
                            <div className={styles.selectorWrapper}>
                              <SkillLevelSelector
                                value={newSkillLevel}
                                onChange={(level) => setNewSkillLevel(level)}
                                hideScaleTabs
                                hideHint
                              />
                            </div>
                            <Button
                              type="button"
                              label={t('profile.skills.add', { defaultValue: 'Add' })}
                              icon="pi pi-plus"
                              onClick={handleAddSkill}
                              disabled={savingSkills}
                              className={styles.addSkillButton}
                            />
                          </div>

                          {currentSkillHint && (
                            <div className={styles.addSkillFormBottom}>
                              <div className={styles.levelHint}>
                                <i className="pi pi-info-circle" />
                                <span>{currentSkillHint}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {skillsError && (
                          <Message severity="error" text={skillsError} className={styles.skillsMessage} />
                        )}
                        {availableSkillsLoading && (
                          <div className={styles.inlineLoading}>
                            <ProgressSpinner strokeWidth="4" />
                          </div>
                        )}
                      </div>

                      {/* Editing skill items */}
                      <div className={styles.skillsList}>
                        {skillsDraft.length === 0 ? (
                          <div className={styles.emptyState}>
                            <i className="pi pi-bolt" />
                            <h4>{t('profile.skills.empty', { defaultValue: 'No skills added yet' })}</h4>
                            <p>{t('profile.skills.emptyPrompt', { defaultValue: 'Use the form above to add your first skill.' })}</p>
                          </div>
                        ) : (
                          skillsDraft.map((skill, index) => (
                            <div key={`${skill.name}-${index}`} className={styles.skillCard}>
                              <div className={styles.skillCardHeader}>
                                <div className={styles.skillNameGroup}>
                                  <span className={styles.skillBadge}>{formatSkillBadge(skill.level)}</span>
                                  <span className={styles.skillTitle}>{skill.name}</span>
                                </div>
                                <Button
                                  icon="pi pi-trash"
                                  severity="danger"
                                  text
                                  rounded
                                  aria-label={t('profile.skills.remove', { defaultValue: 'Remove skill' })}
                                  onClick={() => handleSkillRemove(index)}
                                  disabled={savingSkills}
                                  className={styles.removeSkillBtn}
                                />
                              </div>
                              <SkillLevelSelector
                                value={skill.level}
                                onChange={(level) => handleSkillLevelChange(index, level)}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Read-only skill view */
                    <div className={styles.skillsGrid}>
                      {skills.length === 0 ? (
                        <div className={styles.emptyState}>
                          <i className="pi pi-bolt" />
                          <h4>{t('profile.skills.empty', { defaultValue: 'No skills added yet' })}</h4>
                          <p>{t('profile.skills.emptyPrompt', { defaultValue: 'Click "Manage Skills" above to add your languages and expertise.' })}</p>
                          <Button
                            label={t('profile.skills.addFirst', { defaultValue: 'Add Your First Skill' })}
                            icon="pi pi-plus"
                            size="small"
                            onClick={handleSkillsEditToggle}
                            className={styles.emptyStateCta}
                          />
                        </div>
                      ) : (
                        skills.map((skill, index) => (
                          <div key={`${skill.name}-${index}`} className={styles.skillCardView}>
                            <div className={styles.skillCardViewHeader}>
                              <span className={styles.skillTitle}>{skill.name}</span>
                              <span className={styles.levelPill}>{formatSkillBadge(skill.level)}</span>
                            </div>
                            <SkillLevelSelector value={skill.level} readOnly size="sm" />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FAVOURITES */}
          {activeTab === 2 && (
            <div className={styles.panelAnimated}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderTitle}>
                    <i className="pi pi-heart-fill" style={{ color: '#ef4444' }} />
                    <div>
                      <h3>{t('favourites.title', { defaultValue: 'Favourite Companies' })}</h3>
                      <p className={styles.cardSubtitle}>
                        {t('favourites.subtitle', { defaultValue: 'Companies you have bookmarked for quick access.' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  {favouritesLoading || loadingCompanyDetails ? (
                    <div className={styles.loadingWrapper}>
                      <ProgressSpinner strokeWidth="4" />
                      <p className={styles.loadingText}>{t('common.loading', { defaultValue: 'Loading saved companies...' })}</p>
                    </div>
                  ) : favourites.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIconCircle}>
                        <i className="pi pi-heart" />
                      </div>
                      <h4>{t('favourites.noFavourites', { defaultValue: 'No favourite companies yet' })}</h4>
                      <p>{t('favourites.emptyHint', { defaultValue: 'Explore the catalog and bookmark companies to easily track updates and job openings.' })}</p>
                      <Button
                        label={t('navigation.companies', { defaultValue: 'Browse Companies' })}
                        icon="pi pi-compass"
                        onClick={() => navigate('/companies')}
                        className={styles.emptyStateCta}
                      />
                    </div>
                  ) : (
                    <div className={styles.favouritesGrid}>
                      {(favouritesWithCompanies.length > 0 ? favouritesWithCompanies : favourites).map(
                        (favourite) => (
                          <div key={favourite.id} className={styles.companyCard}>
                            <div className={styles.companyIconBox}>
                              <i className="pi pi-building" />
                            </div>
                            <div className={styles.companyMain}>
                              <h4
                                className={styles.companyName}
                                onClick={() => navigate(`/companies/${favourite.company_id}`)}
                              >
                                {favourite.company?.name || `Company ID: ${favourite.company_id}`}
                              </h4>
                              {favourite.company?.mainbusinesslinename && (
                                <span className={styles.categoryBadge}>
                                  {favourite.company.mainbusinesslinename}
                                </span>
                              )}
                            </div>
                            <div className={styles.companyActions}>
                              <Button
                                icon="pi pi-external-link"
                                text
                                rounded
                                onClick={() => navigate(`/companies/${favourite.company_id}`)}
                                aria-label="View company"
                                className={styles.companyViewBtn}
                              />
                              <Button
                                icon="pi pi-heart-fill"
                                onClick={() => handleRemoveFavourite(favourite.company_id)}
                                severity="danger"
                                text
                                rounded
                                aria-label={t('favourites.removeFromFavourites', { defaultValue: 'Remove from favourites' })}
                                className={styles.unfavBtn}
                              />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 3 && (
            <div className={styles.panelAnimated}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderTitle}>
                    <i className="pi pi-bell" />
                    <div>
                      <h3>{t('notifications.title', { defaultValue: 'Notifications & Updates' })}</h3>
                      <p className={styles.cardSubtitle}>
                        {t('notifications.subtitle', { defaultValue: 'Stay updated with activities from companies you follow.' })}
                      </p>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <Button
                      label={t('notifications.markAllAsRead', { defaultValue: 'Mark all as read' })}
                      onClick={handleMarkAllAsRead}
                      size="small"
                      variant="outlined"
                      icon="pi pi-check-circle"
                      className={styles.markAllBtn}
                    />
                  )}
                </div>

                <div className={styles.cardBody}>
                  {notificationsLoading ? (
                    <div className={styles.loadingWrapper}>
                      <ProgressSpinner strokeWidth="4" />
                      <p className={styles.loadingText}>{t('common.loading', { defaultValue: 'Loading notifications...' })}</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIconCircle}>
                        <i className="pi pi-bell" />
                      </div>
                      <h4>{t('notifications.noNotifications', { defaultValue: 'No notifications' })}</h4>
                      <p>{t('notifications.allCaughtUp', { defaultValue: "You're all caught up! Updates about your bookmarked companies will appear here." })}</p>
                    </div>
                  ) : (
                    <div className={styles.notificationsList}>
                      {notifications.map((notification: UserNotification) => (
                        <div
                          key={notification.id}
                          className={`${styles.notificationCard} ${
                            !notification.read ? styles.notificationUnread : ''
                          }`}
                        >
                          <div className={styles.notifIconSide}>
                            <div className={styles.notifBellCircle}>
                              <i className="pi pi-bell" />
                            </div>
                            {!notification.read && <span className={styles.unreadPulseDot} />}
                          </div>

                          <div className={styles.notifBody}>
                            <div className={styles.notifHeaderRow}>
                              <h4
                                className={styles.notifCompanyLink}
                                onClick={() => navigate(`/companies/${notification.company_id}`)}
                              >
                                {notification.company?.name || `Company ID: ${notification.company_id}`}
                              </h4>
                              <span className={styles.notifTime}>
                                <i className="pi pi-clock" />
                                {new Date(notification.created_at).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            {notification.title && notification.title !== notification.message && (
                              <h5 className={styles.notifSubject}>{notification.title}</h5>
                            )}
                            <p className={styles.notifMessage}>{notification.message}</p>
                          </div>

                          {!notification.read && (
                            <div className={styles.notifAction}>
                              <Button
                                icon="pi pi-check"
                                onClick={() => handleMarkAsRead(notification.id)}
                                severity="success"
                                text
                                rounded
                                aria-label={t('notifications.markAsRead', { defaultValue: 'Mark as read' })}
                                className={styles.markReadBtn}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RESUME & CV */}
          {activeTab === 4 && (
            <div className={styles.panelAnimated}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderTitle}>
                    <i className="pi pi-file" />
                    <div>
                      <h3>{t('profile.resume', { defaultValue: 'Resume & Documents' })}</h3>
                      <p className={styles.cardSubtitle}>
                        {t('profile.resumeSubtitle', { defaultValue: 'Upload your existing CV or create a structured resume with STAR methodology.' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.resumeGrid}>
                    {/* Upload Card */}
                    <div className={styles.resumeUploadCard}>
                      <div className={styles.resumeUploadHeader}>
                        <i className="pi pi-cloud-upload" />
                        <h4>{t('profile.uploadResume', { defaultValue: 'Upload CV Document' })}</h4>
                        <p className={styles.resumeFormatNotice}>
                          {t('profile.resumeHint', { defaultValue: 'Supported formats: PDF, DOC, DOCX. Max file size: 5 MB.' })}
                        </p>
                      </div>

                      <div className={styles.fileUploadContainer}>
                        <FileUpload
                          mode="basic"
                          name="resume"
                          accept=".pdf,.doc,.docx"
                          maxFileSize={5000000}
                          auto
                          chooseLabel={t('profile.chooseFile', { defaultValue: 'Select File from Computer' })}
                          onUpload={() => {
                            showNotification(t('profile.resumeUploaded', { defaultValue: 'Resume uploaded successfully' }), 'success');
                          }}
                          onError={() => {
                            showNotification(t('profile.resumeUploadError', { defaultValue: 'Failed to upload resume' }), 'error');
                          }}
                          className={styles.customFileUpload}
                        />
                      </div>
                    </div>

                    {/* STAR Builder Promo Card */}
                    <div className={styles.starPromoCard}>
                      <div className={styles.starBadge}>
                        <i className="pi pi-star-fill" />
                        <span>Interactive Tool</span>
                      </div>
                      <h4 className={styles.starTitle}>
                        {t('profile.launchResumeBuilder', { defaultValue: 'STAR Resume Builder' })}
                      </h4>
                      <p className={styles.starDescription}>
                        Craft an ATS-optimized CV using the Situation, Task, Action, Result framework. Perfect for applications in Finland and the EU.
                      </p>
                      <Button
                        label={t('profile.startBuilder', { defaultValue: 'Open Resume Builder' })}
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        onClick={() => navigate('/profile/resume-builder')}
                        className={styles.starLaunchBtn}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;