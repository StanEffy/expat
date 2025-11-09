import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { PASSWORD_RESET_ENDPOINTS } from '../constants/api';
import { useTranslation } from 'react-i18next';
import SEO from '../components/Common/SEO';
import styles from './PasswordReset.module.scss';

const PasswordReset = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError(t('passwordReset.errors.noToken'));
    }
  }, [searchParams, t]);

  const handlePasswordChange = (e: { value: string }, fieldName: string) => {
    if (fieldName === 'password') {
      setPassword(e.value);
    } else {
      setConfirmPassword(e.value);
    }
    setError('');
  };

  const validatePassword = (): boolean => {
    if (password.length < 8) {
      setError(t('passwordReset.errors.passwordTooShort'));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t('passwordReset.errors.passwordsDontMatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(PASSWORD_RESET_ENDPOINTS.RESET, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('passwordReset.errors.resetFailed'));
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('passwordReset.errors.resetFailed'));
    } finally {
      setLoading(false);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (success) {
    return (
      <>
        <SEO
          title={`${t('passwordReset.resetTitle')} - ${t('app.title')}`}
          description="Reset password"
          url={currentUrl}
          noindex={true}
        />
        <div className={styles.container}>
          <div className={styles.wrapper}>
            <Card>
              <div className={styles.successMessage}>
                <Message
                  severity="success"
                  text={t('passwordReset.resetSuccess')}
                  className={styles.message}
                />
                <p>{t('passwordReset.redirecting')}</p>
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
        title={`${t('passwordReset.resetTitle')} - ${t('app.title')}`}
        description="Reset password"
        url={currentUrl}
        noindex={true}
      />
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <Card title={t('passwordReset.resetTitle')}>
            {error && (
              <Message severity="error" text={error} className={styles.errorMessage} />
            )}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="password">{t('passwordReset.newPassword')}</label>
                <Password
                  id="password"
                  value={password}
                  onChange={(e) => handlePasswordChange({ value: e.target.value }, 'password')}
                  required
                  autoComplete="new-password"
                  feedback={true}
                  toggleMask
                  className={styles.passwordInput}
                  inputStyle={{ width: '100%' }}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="confirmPassword">{t('passwordReset.confirmPassword')}</label>
                <Password
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => handlePasswordChange({ value: e.target.value }, 'confirmPassword')}
                  required
                  autoComplete="new-password"
                  feedback={false}
                  toggleMask
                  className={styles.passwordInput}
                  inputStyle={{ width: '100%' }}
                />
              </div>
              <Button
                type="submit"
                label={loading ? t('common.loading') : t('passwordReset.submit')}
                disabled={loading || !token}
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

export default PasswordReset;


