import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import styles from './Profile.module.scss';

interface UserProfile {
  email: string;
  role: string;
  createdAt: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // TODO: Replace with actual API call
        const response = await fetch('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Message severity="error" text={error} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile</h1>
      <Card title="User Information" className={styles.card}>
        <div className={styles.profileInfo}>
          <p>
            <strong>Email:</strong> {profile?.email}
          </p>
          <p>
            <strong>Role:</strong> {profile?.role}
          </p>
          <p>
            <strong>Member since:</strong>{' '}
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
      </Card>
      <Button
        label="Logout"
        onClick={handleLogout}
        severity="secondary"
        className={styles.logoutButton}
      />
    </div>
  );
};

export default Profile; 