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
      <div style={{ maxWidth: '500px', margin: '32px auto', padding: '0 16px' }}>
        <Card title="Reset Password">
          {error && (
            <Message 
              severity={error.includes('sent') ? 'success' : 'error'} 
              text={error}
              style={{ marginBottom: '16px' }}
            />
          )}
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="p-field">
              <label htmlFor="username">Username</label>
              <InputText
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Button
                label="Back to Login"
                outlined
                onClick={() => setForgotPasswordMode(false)}
                style={{ flex: 1 }}
              />
              <Button
                type="submit"
                label={loading ? 'Sending...' : 'Send Reset Link'}
                disabled={loading}
                loading={loading}
                style={{ flex: 1 }}
              />
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '32px auto', padding: '0 16px' }}>
      <Card>
        <TabView activeIndex={tabValue} onTabChange={handleTabChange}>
          <TabPanel header="Sign In">
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Sign In</h2>
            {error && (
              <Message 
                severity="error" 
                text={error}
                style={{ marginBottom: '16px' }}
              />
            )}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="p-field">
                <label htmlFor="login-username">Username</label>
                <InputText
                  id="login-username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoComplete="username"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="p-field">
                <label htmlFor="login-password">Password</label>
                <Password
                  id="login-password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e, 'password')}
                  required
                  autoComplete="current-password"
                  feedback={false}
                  toggleMask
                  style={{ width: '100%' }}
                  inputStyle={{ width: '100%' }}
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setForgotPasswordMode(true);
                }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#007bff', 
                  textDecoration: 'underline', 
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
              <Button
                type="submit"
                label={loading ? 'Signing in...' : 'Sign In'}
                disabled={loading}
                loading={loading}
                style={{ width: '100%', marginTop: '8px' }}
              />
            </form>
          </TabPanel>

          <TabPanel header="Sign Up">
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Sign Up</h2>
            {error && (
              <Message 
                severity="error" 
                text={error}
                style={{ marginBottom: '16px' }}
              />
            )}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="p-field">
                <label htmlFor="name">Name</label>
                <InputText
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%' }}
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
                  style={{ width: '100%' }}
                />
              </div>
              <div className="p-field">
                <label htmlFor="register-password">Password</label>
                <Password
                  id="register-password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e, 'password')}
                  required
                  feedback={false}
                  toggleMask
                  style={{ width: '100%' }}
                  inputStyle={{ width: '100%' }}
                />
              </div>
              <div className="p-field">
                <label htmlFor="confirm-password">Confirm Password</label>
                <Password
                  id="confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handlePasswordChange(e, 'confirmPassword')}
                  required
                  feedback={false}
                  toggleMask
                  style={{ width: '100%' }}
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
                  style={{ width: '100%' }}
                />
              </div>
              <Button
                type="submit"
                label={loading ? 'Signing up...' : 'Sign Up'}
                disabled={loading}
                loading={loading}
                style={{ width: '100%', marginTop: '8px' }}
              />
            </form>
          </TabPanel>
        </TabView>
      </Card>
    </div>
  );
};

export default Login; 