import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  Grid,
} from '@mui/material';
import { COMPANY_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';
import { useNotification } from '../contexts/NotificationContext';

interface Company {
  id: number;
  name: string;
  description: string;
}

const Companies = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const headers = getAuthHeaders();
        if (Object.keys(headers).length === 0) {
          return; // Redirect will happen in getAuthHeaders
        }

        const response = await fetch(COMPANY_ENDPOINTS.LIST, {
          headers,
        });

        if (!response.ok) {
        
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch companies');
        }

        const {data} = await response.json();
        console.log(data, 'data is not ok');
        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }

        setCompanies(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching companies';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [showNotification]);

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
        <Typography color="error" sx={{ mt: 4 }}>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  if (companies.length === 0) {
    return (
      <Container>
        <Typography sx={{ mt: 4 }}>
          No companies found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Companies
        </Typography>
        <Grid container spacing={3}>
          {companies.map((company) => (
            <Grid item xs={12} sm={6} md={4} key={company.id}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h2">
                    {company.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {company.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/companies/${company.id}`)}
                  >
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Companies; 