import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Button,
  Alert,
} from '@mui/material';

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
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        <Card sx={{ maxWidth: 600 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Typography>
              <strong>Email:</strong> {profile?.email}
            </Typography>
            <Typography>
              <strong>Role:</strong> {profile?.role}
            </Typography>
            <Typography>
              <strong>Member since:</strong>{' '}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : 'N/A'}
            </Typography>
          </CardContent>
        </Card>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLogout}
          sx={{ mt: 3 }}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default Profile; 