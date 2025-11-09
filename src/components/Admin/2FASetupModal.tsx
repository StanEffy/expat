import { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { ADMIN_ENDPOINTS } from '../../constants/api';
import { getAuthHeaders } from '../../utils/auth';
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
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    if (visible && step === 'setup') {
      setQrError(false);
      setQrUrl('');
      setSecret('');
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
        setSetupLoading(false);
        return;
      }

      const response = await fetch(ADMIN_ENDPOINTS['2FA_SETUP'], {
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('2FA setup failed:', response.status, errorText);
        throw new Error(`Failed to fetch 2FA setup: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('2FA setup response:', data);
      
      if (!data.secret) {
        throw new Error('No secret returned from backend');
      }
      
      setSecret(data.secret);
      setQrError(false);
      
      // Handle qr_url - it might be a TOTP URI string or already a QR code image URL
      if (data.qr_url) {
        setQrUrl(data.qr_url);
      } else {
        console.warn('No qr_url in response, QR code will not be displayed');
        setQrUrl('');
      }
      
      setStep('verify');
    } catch (err) {
      console.error('Error fetching 2FA setup:', err);
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
            {qrUrl && !qrError ? (
              <div className={styles.qrCode}>
                {/* Check if qrUrl is already a data URL or image URL, otherwise generate QR code from TOTP URI */}
                {qrUrl.startsWith('data:image') || qrUrl.startsWith('http://') || qrUrl.startsWith('https://') ? (
                  <img 
                    src={qrUrl} 
                    alt="QR Code" 
                    onError={() => {
                      console.error('Failed to load QR code image:', qrUrl);
                      setQrError(true);
                    }} 
                  />
                ) : (
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`} 
                    alt="QR Code" 
                    onError={() => {
                      console.error('Failed to generate QR code from:', qrUrl);
                      setQrError(true);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className={styles.qrCode}>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  <p>QR code not available.</p>
                  <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    {secret ? 'Please use the secret below to manually set up 2FA.' : 'Please check your connection and try again.'}
                  </p>
                </div>
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


