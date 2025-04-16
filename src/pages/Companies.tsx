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
  CircularProgress,
} from '@mui/material';
import { COMPANY_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';
import { useNotification } from '../contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

interface Company {
  id: number;
  name: string;
  description: string;
}

const DEFAULT_COUNT = 10;

const Companies = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchCompanies = async (pageNumber: number, append: boolean = false) => {
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        return;
      }

      const response = await fetch(COMPANY_ENDPOINTS.LIST(pageNumber, DEFAULT_COUNT), {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch companies');
      }

      const { data } = await response.json();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      setCompanies(prev => append ? [...prev, ...data] : data);
      setHasMore(data.length === DEFAULT_COUNT);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching companies';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1);
  }, [showNotification]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchCompanies(nextPage, true);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
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
          {t('common.tryAgain')}
        </Button>
      </Container>
    );
  }

  if (companies.length === 0) {
    return (
      <Container>
        <Typography sx={{ mt: 4 }}>
          {t('common.noCompanies')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {company.name}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {company.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/companies/${company.id}`)}
                >
                  {t('common.viewDetails')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
          <Button
            variant="contained"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <CircularProgress size={24} />
            ) : (
              t('common.showMore')
            )}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Companies; 