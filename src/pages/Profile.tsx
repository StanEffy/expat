import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <Message severity="error" text={error} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ marginBottom: '32px' }}>Profile</h1>
      <Card title="User Information" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
        style={{ marginTop: '24px' }}
      />
    </div>
  );
};

export default Profile; 