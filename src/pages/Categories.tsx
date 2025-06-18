import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  CircularProgress,
  Button,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../contexts/NotificationContext';
import { getAuthHeaders } from '../utils/auth';

interface Category {
  id: number;
  name: string;
  description: string;
}

const Categories = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        return;
      }

      const response = await fetch('/api/categories', {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch categories');
      }

      const { data } = await response.json();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      setCategories(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching categories';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [showNotification]);

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

  if (categories.length === 0) {
    return (
      <Container>
        <Typography sx={{ mt: 4 }}>
          {t('common.noCategories')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" sx={{ mt: 4, mb: 4 }}>
        {t('categories.title')}
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)' 
        }, 
        gap: 3 
      }}>
        {categories.map((category) => (
          <Card key={category.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} component="h3">
                {category.name}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {category.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default Categories; 