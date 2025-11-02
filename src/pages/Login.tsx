import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { Message } from 'primereact/message';
import { AUTH_ENDPOINTS, DEFAULT_CONFIG } from '../constants/api';
import { setToken } from '../utils/auth';
import styles from './Login.module.scss';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  
  // Read invite code from query parameter or use default
  const inviteCodeFromQuery = searchParams.get('invite_code') || DEFAULT_CONFIG.INVITE_CODE;
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    inviteCode: inviteCodeFromQuery,
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Update invite code when query parameter changes
  useEffect(() => {
    const inviteCodeFromQuery = searchParams.get('invite_code') || DEFAULT_CONFIG.INVITE_CODE;
    setFormData((prev) => ({ ...prev, inviteCode: inviteCodeFromQuery }));
  }, [searchParams]);

  const handleTabChange = (e: { index: number }) => {
    setTabValue(e.index);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: { value: string }, fieldName: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: e.value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      setToken(data.token);
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          inviteCode: formData.inviteCode,
          name: formData.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // Automatically sign in after successful registration
      try {
        const loginResponse = await fetch(AUTH_ENDPOINTS.LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          setToken(data.token);
          window.location.href = '/';
          return;
        }
      } catch (loginErr) {
        // If auto login fails, navigate to login page
        console.error('Auto login failed:', loginErr);
      }

      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.username }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reset password email');
      }

      setError('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (forgotPasswordMode) {
    return (
      <div className={styles.container}>
        <Card title="Reset Password">
          {error && (
            <Message 
              severity={error.includes('sent') ? 'success' : 'error'} 
              text={error}
              className={styles.errorMessage}
            />
          )}
          <form onSubmit={handleForgotPassword} className={styles.form}>
            <div className="p-field">
              <label htmlFor="username">Username</label>
              <InputText
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.buttonGroup}>
              <Button
                label="Back to Login"
                outlined
                onClick={() => setForgotPasswordMode(false)}
                className={styles.buttonGroupButton}
              />
              <Button
                type="submit"
                label={loading ? 'Sending...' : 'Send Reset Link'}
                disabled={loading}
                loading={loading}
                className={styles.buttonGroupButton}
              />
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Card>
        <TabView activeIndex={tabValue} onTabChange={handleTabChange}>
          <TabPanel header="Sign In">
            <h2 className={styles.title}>Sign In</h2>
            {error && (
              <Message 
                severity="error" 
                text={error}
                className={styles.errorMessage}
              />
            )}
            <form onSubmit={handleLogin} className={styles.form}>
              <div className="p-field">
                <label htmlFor="login-username">Username</label>
                <InputText
                  id="login-username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  className={styles.input}
                />
              </div>
              <div className="p-field">
                <label htmlFor="login-password">Password</label>
                <Password
                  id="login-password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => handlePasswordChange({ value: e.target.value }, 'password')}
                  required
                  autoComplete="current-password"
                  feedback={false}
                  toggleMask
                  className={styles.passwordInput}
                  inputStyle={{ width: '100%' }}
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setForgotPasswordMode(true);
                }}
                className={styles.forgotPasswordButton}
              >
                Forgot password?
              </button>
              <Button
                type="submit"
                label={loading ? 'Signing in...' : 'Sign In'}
                disabled={loading}
                loading={loading}
                className={styles.submitButton}
              />
            </form>
          </TabPanel>

          <TabPanel header="Sign Up">
            <h2 className={styles.title}>Sign Up</h2>
            {error && (
              <Message 
                severity="error" 
                text={error}
                className={styles.errorMessage}
              />
            )}
            <form onSubmit={handleRegister} className={styles.form}>
              <div className="p-field">
                <label htmlFor="name">Name</label>
                <InputText
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>
              <div className="p-field">
                <label htmlFor="register-username">Username</label>
                <InputText
                  id="register-username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>
              <div className="p-field">
                <label htmlFor="register-password">Password</label>
                <Password
                  id="register-password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => handlePasswordChange({ value: e.target.value }, 'password')}
                  required
                  feedback={false}
                  toggleMask
                  className={styles.passwordInput}
                  inputStyle={{ width: '100%' }}
                />
              </div>
              <div className="p-field">
                <label htmlFor="confirm-password">Confirm Password</label>
                <Password
                  id="confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handlePasswordChange({ value: e.target.value }, 'confirmPassword')}
                  required
                  feedback={false}
                  toggleMask
                  className={styles.passwordInput}
                  inputStyle={{ width: '100%' }}
                />
              </div>
              <div className="p-field">
                <label htmlFor="inviteCode">Invite Code</label>
                <InputText
                  id="inviteCode"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>
              <Button
                type="submit"
                label={loading ? 'Signing up...' : 'Sign Up'}
                disabled={loading}
                loading={loading}
                className={styles.submitButton}
              />
            </form>
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default Login; 