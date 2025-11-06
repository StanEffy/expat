import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { checkAdminRole, isTokenValid, getAdmin2FASession, removeAdmin2FASession } from '../utils/auth';
import TwoFASetupModal from './2FASetupModal';
import TwoFAVerifyModal from './2FAVerifyModal';
import { ADMIN_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import styles from './AdminRouteGuard.module.scss';

interface AdminRouteGuardProps {
  children: ReactNode;
}

interface TwoFAStatus {
  enabled: boolean;
  verified: boolean;
}

const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string>('');
  const [twoFAStatus, setTwoFAStatus] = useState<TwoFAStatus | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    setLoading(true);
    setError('');

    // Check if user is authenticated
    if (!isTokenValid()) {
      navigate('/login');
      return;
    }

    // Check if user is admin
    const admin = await checkAdminRole();
    if (!admin) {
      setError(t('admin.errors.notAdmin'));
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    // Check 2FA status
    await check2FAStatus();
  };

  const check2FAStatus = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        navigate('/login');
        return;
      }

      // 1. Check if session token exists in storage
      const storedSessionToken = getAdmin2FASession();

      if (storedSessionToken) {
        // 2. Validate the stored session token
        try {
          const validationResponse = await fetch(ADMIN_ENDPOINTS['2FA_SESSION_VALIDATE'], {
            headers: {
              ...headers,
              'X-Admin-2FA-Session': storedSessionToken,
            },
          });

          if (validationResponse.ok) {
            const validation = await validationResponse.json();
            if (validation.valid) {
              // Session is still valid - proceed without showing 2FA modal
              setTwoFAStatus({ enabled: true, verified: true });
              setLoading(false);
              return;
            } else {
              // Session expired or invalid - clear it
              console.log('Session invalid:', validation.reason);
              removeAdmin2FASession();
            }
          } else {
            // Validation endpoint failed, assume session is invalid
            removeAdmin2FASession();
          }
        } catch (validationErr) {
          // Validation endpoint might not exist, fall back to old method
          console.log('Session validation endpoint not available, using fallback');
          removeAdmin2FASession();
        }
      }

      // 3. No valid session token - check 2FA status and show appropriate modal
      try {
        const statusResponse = await fetch(ADMIN_ENDPOINTS['2FA_STATUS'], {
          headers,
        });

        if (statusResponse.ok) {
          const status = await statusResponse.json();
          if (status.enabled) {
            // Show 2FA verification modal
            setTwoFAStatus({ enabled: true, verified: false });
            setShowVerifyModal(true);
          } else {
            // Show 2FA setup modal
            setTwoFAStatus({ enabled: false, verified: false });
            setShowSetupModal(true);
          }
        } else {
          // Status endpoint failed, fall back to checking protected endpoint
          const response = await fetch(ADMIN_ENDPOINTS.USERS, {
            headers,
          });

          if (response.ok) {
            // No 2FA required, but this shouldn't happen for admin routes
            setTwoFAStatus({ enabled: false, verified: false });
            setShowSetupModal(true);
            return;
          }

          // Parse error message to determine 2FA status
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || '';

          if (errorMessage.includes('2FA setup required') || errorMessage.includes('set up 2FA')) {
            // 2FA not enabled, show setup modal
            setTwoFAStatus({ enabled: false, verified: false });
            setShowSetupModal(true);
          } else if (response.status === 403) {
            // 2FA is enabled but not verified
            setTwoFAStatus({ enabled: true, verified: false });
            setShowVerifyModal(true);
          } else {
            throw new Error(`Unexpected response: ${response.status}`);
          }
        }
      } catch (statusErr) {
        console.error('Error checking 2FA status:', statusErr);
        setError(t('admin.errors.loadFailed'));
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking 2FA status:', err);
      setError(t('admin.errors.loadFailed'));
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    setTwoFAStatus({ enabled: true, verified: false });
    setShowVerifyModal(true);
  };

  const handleVerifyComplete = (_sessionToken: string) => {
    // Session token is already stored by TwoFAVerifyModal via setAdmin2FASession
    setShowVerifyModal(false);
    setTwoFAStatus({ enabled: true, verified: true });
    setLoading(false);
  };

  const handleSetupCancel = () => {
    // Can't cancel 2FA setup - it's required
    navigate('/');
  };

  const handleVerifyCancel = () => {
    // Can't cancel 2FA verification - it's required
    navigate('/');
  };

  if (loading && !twoFAStatus) {
    return (
      <div className={styles.loadingContainer}>
        <ProgressSpinner />
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Message severity="error" text={error} />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Show 2FA setup/verify modals
  if (twoFAStatus && !twoFAStatus.verified) {
    return (
      <>
        {showSetupModal && (
          <TwoFASetupModal
            visible={showSetupModal}
            onComplete={handleSetupComplete}
            onCancel={handleSetupCancel}
          />
        )}
        {showVerifyModal && (
          <TwoFAVerifyModal
            visible={showVerifyModal}
            onVerified={handleVerifyComplete}
            onCancel={handleVerifyCancel}
          />
        )}
        <div className={styles.loadingContainer}>
          <ProgressSpinner />
          <p>{t('admin.2fa.pleaseWait')}</p>
        </div>
      </>
    );
  }

  return <>{children}</>;
};

export default AdminRouteGuard;

