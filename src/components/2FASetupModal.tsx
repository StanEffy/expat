import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ADMIN_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import styles from './2FASetupModal.module.scss';

interface TwoFASetupModalProps {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

const TwoFASetupModal = ({ visible, onComplete, onCancel }: TwoFASetupModalProps) => {
  const { t } = useTranslation();
  const [secret, setSecret] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify'>('setup');

  useEffect(() => {
    if (visible && step === 'setup') {
      fetchSetup();
    }
  }, [visible, step]);

  const fetchSetup = async () => {
    setSetupLoading(true);
    setError('');
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setError(t('admin.errors.unauthorized'));
        return;
      }

      const response = await fetch(ADMIN_ENDPOINTS['2FA_SETUP'], {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch 2FA setup');
      }

      const data = await response.json();
      setSecret(data.secret);
      setQrUrl(data.qr_url);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.errors.setupFailed'));
    } finally {
      setSetupLoading(false);
    }
  };

  const handleEnable = async () => {
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

      const response = await fetch(ADMIN_ENDPOINTS['2FA_ENABLE'], {
        method: 'POST',
        headers,
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('admin.errors.enableFailed'));
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.errors.enableFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      // Show success message (you can add a toast here if needed)
    }
  };

  return (
    <Dialog
      visible={visible}
      onHide={onCancel}
      header={t('admin.2fa.setupTitle')}
      modal
      className={styles.dialog}
      style={{ width: '90vw', maxWidth: '500px' }}
    >
      {setupLoading ? (
        <div className={styles.loading}>
          <p>{t('common.loading')}</p>
        </div>
      ) : step === 'setup' ? (
        <div className={styles.setupStep}>
          <p>{t('admin.2fa.setupMessage')}</p>
          <Button
            label={t('common.tryAgain')}
            onClick={fetchSetup}
            className={styles.button}
          />
        </div>
      ) : (
        <div className={styles.verifyStep}>
          <div className={styles.qrSection}>
            <p className={styles.instructions}>{t('admin.2fa.scanQR')}</p>
            {qrUrl && (
              <div className={styles.qrCode}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`} alt="QR Code" />
              </div>
            )}
            {secret && (
              <div className={styles.secretSection}>
                <p className={styles.secretLabel}>{t('admin.2fa.backupSecret')}</p>
                <div className={styles.secretDisplay}>
                  <code className={styles.secretCode}>{secret}</code>
                  <Button
                    icon="pi pi-copy"
                    onClick={handleCopySecret}
                    text
                    rounded
                    title={t('admin.2fa.copySecret')}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={styles.verifySection}>
            <p className={styles.instructions}>{t('admin.2fa.enterToken')}</p>
            <InputText
              value={token}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setToken(value);
                setError('');
              }}
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
            />
            <Button
              label={t('admin.2fa.enable')}
              onClick={handleEnable}
              loading={loading}
              disabled={loading || token.length !== 6}
              className={styles.button}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default TwoFASetupModal;


