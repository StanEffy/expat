import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import Button from '../components/Common/Button';
import { Message } from 'primereact/message';
import { PASSWORD_RESET_ENDPOINTS } from '../constants/api';
import { useTranslation } from 'react-i18next';
import SEO from '../components/Common/SEO';
import styles from './PasswordResetRequest.module.scss';

const PasswordResetRequest = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await fetch(PASSWORD_RESET_ENDPOINTS.REQUEST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Always show success message (security measure - backend always returns ok)
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('passwordReset.errors.requestFailed'));
    } finally {
      setLoading(false);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (success) {
    return (
      <>
        <SEO
          title={`${t('passwordReset.title')} - ${t('app.title')}`}
          description="Request password reset"
          url={currentUrl}
          noindex={true}
        />
        <div className={styles.container}>
          <div className={styles.wrapper}>
            <Card>
              <div className={styles.successMessage}>
                <Message
                  severity="success"
                  text={t('passwordReset.successMessage')}
                  className={styles.message}
                />
                <Button
                  label={t('passwordReset.backToLogin')}
                  onClick={() => navigate('/login')}
                  className={styles.button}
                />
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${t('passwordReset.title')} - ${t('app.title')}`}
        description="Request password reset"
        url={currentUrl}
        noindex={true}
      />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <Card title={t('passwordReset.title')}>
            {error && (
              <Message severity="error" text={error} className={styles.errorMessage} />
            )}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email">{t('passwordReset.email')}</label>
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={styles.input}
                  placeholder={t('passwordReset.emailPlaceholder')}
                />
              </div>
              <Button
                type="submit"
                label={loading ? t('common.loading') : t('passwordReset.submit')}
                disabled={loading}
                loading={loading}
                className={styles.button}
              />
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PasswordResetRequest;


