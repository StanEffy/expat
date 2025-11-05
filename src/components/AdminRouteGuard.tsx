import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { checkAdminRole, isTokenValid, getAdmin2FASession } from '../utils/auth';
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

      // First, check if we have a valid session token
      const sessionToken = getAdmin2FASession();
      if (sessionToken) {
        // Try to access a protected endpoint with the session token
        const response = await fetch(ADMIN_ENDPOINTS.USERS, {
          headers: {
            ...headers,
            'X-Admin-2FA-Session': sessionToken,
          },
        });

        if (response.ok) {
          // Session is valid, we're good
          setTwoFAStatus({ enabled: true, verified: true });
          setLoading(false);
          return;
        } else if (response.status === 403) {
          // Session expired, need to re-verify
          setTwoFAStatus({ enabled: true, verified: false });
          setShowVerifyModal(true);
          return;
        }
      }

      // No session token or session expired - check if 2FA is enabled
      // Try to access protected endpoint without session
      const response = await fetch(ADMIN_ENDPOINTS.USERS, {
        headers,
      });

      if (response.status === 403) {
        // 2FA is enabled but not verified
        setTwoFAStatus({ enabled: true, verified: false });
        setShowVerifyModal(true);
      } else {
        // 2FA might not be enabled, try setup endpoint
        const setupResponse = await fetch(ADMIN_ENDPOINTS['2FA_SETUP'], {
          headers,
        });
        if (setupResponse.ok) {
          // 2FA not enabled, need setup
          setTwoFAStatus({ enabled: false, verified: false });
          setShowSetupModal(true);
        } else {
          // 2FA enabled but not verified
          setTwoFAStatus({ enabled: true, verified: false });
          setShowVerifyModal(true);
        }
      }
    } catch (err) {
      console.error('Error checking 2FA status:', err);
      // Assume 2FA not enabled if we can't check
      setTwoFAStatus({ enabled: false, verified: false });
      setShowSetupModal(true);
    }
  };

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    setTwoFAStatus({ enabled: true, verified: false });
    setShowVerifyModal(true);
  };

  const handleVerifyComplete = () => {
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

