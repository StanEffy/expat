import { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import Button from '../Common/Button';
import { Message } from 'primereact/message';
import { ADMIN_ENDPOINTS } from '../../constants/api';
import { getAuthHeaders, setAdmin2FASession } from '../../utils/auth';
import { useTranslation } from 'react-i18next';
import styles from './2FAVerifyModal.module.scss';

interface TwoFAVerifyModalProps {
  visible: boolean;
  onVerified: (sessionToken: string) => void;
  onCancel: () => void;
}

const TwoFAVerifyModal = ({ visible, onVerified, onCancel }: TwoFAVerifyModalProps) => {
  const { t } = useTranslation();
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError(t('admin.errors.invalidToken'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setError(t('admin.errors.unauthorized'));
        return;
      }

      const response = await fetch(ADMIN_ENDPOINTS['2FA_VERIFY'], {
        method: 'POST',
        headers,
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('admin.errors.verificationFailed'));
      }

      const data = await response.json();
      const sessionToken = data.admin_session_token;

      if (!sessionToken) {
        throw new Error(t('admin.errors.noSessionToken'));
      }

      setAdmin2FASession(sessionToken);
      onVerified(sessionToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.errors.verificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && token.length === 6 && !loading) {
      handleVerify();
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={onCancel}
      header={t('admin.2fa.verifyTitle')}
      modal
      className={styles.dialog}
      style={{ width: '90vw', maxWidth: '400px' }}
      closable={false}
    >
      <div className={styles.content}>
        <p className={styles.message}>{t('admin.2fa.verifyMessage')}</p>

        <div className={styles.inputSection}>
          <InputText
            value={token}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setToken(value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder="000000"
            maxLength={6}
            className={styles.tokenInput}
            autoFocus
          />
          {error && (
            <Message severity="error" text={error} className={styles.errorMessage} />
          )}
        </div>

        <div className={styles.actions}>
          <Button
            label={t('common.cancel')}
            onClick={onCancel}
            severity="secondary"
            className={styles.button}
            disabled={loading}
          />
          <Button
            label={t('admin.2fa.verify')}
            onClick={handleVerify}
            loading={loading}
            disabled={loading || token.length !== 6}
            className={styles.button}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default TwoFAVerifyModal;


