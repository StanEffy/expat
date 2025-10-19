import { useState, useEffect, useCallback } from 'react';
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
import { CATEGORY_ENDPOINTS } from '../constants/api';

interface NaceCategory {
  mainbusinessline?: string | null;
  name?: string | null; // FI
  name_en?: string | null; // EN
}

interface GeneralCategory {
  id: number;
  code: string;
  name_fi: string;
  name_en: string;
  description_fi?: string | null;
  description_en?: string | null;
}

const Categories = () => {
  const { t, i18n } = useTranslation();
  const { showNotification } = useNotification();
  const [naceCategories, setNaceCategories] = useState<NaceCategory[]>([]);
  const [generalCategories, setGeneralCategories] = useState<GeneralCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        return;
      }

      const [naceRes, generalRes] = await Promise.all([
        fetch(CATEGORY_ENDPOINTS.LIST, { headers }),
        fetch(CATEGORY_ENDPOINTS.GENERAL, { headers }),
      ]);

      if (!naceRes.ok) {
        const errorData = await naceRes.json();
        throw new Error(errorData.message || 'Failed to fetch categories');
      }

      if (!generalRes.ok) {
        const errorData = await generalRes.json();
        throw new Error(errorData.message || 'Failed to fetch general categories');
      }

      const { data: naceData } = await naceRes.json();
      const { data: generalData } = await generalRes.json();

      setNaceCategories(Array.isArray(naceData) ? naceData : []);
      setGeneralCategories(Array.isArray(generalData) ? generalData : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching categories';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  return (
    <Container>
      <Typography variant="h4" component="h1" sx={{ mt: 4, mb: 2 }}>
        {t('categories.title')}
      </Typography>

      {/* General Categories */}
      <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
        {i18n.language === 'fi' ? 'Yleiset toimialat' : 'General Categories'}
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
        gap: 3 
      }}>
        {generalCategories.map((cat) => (
          <Card key={cat.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 'bold' }} component="h3">
                {i18n.language === 'fi' ? cat.name_fi : cat.name_en}
              </Typography>
              {(cat.description_en || cat.description_fi) && (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {i18n.language === 'fi' ? (cat.description_fi ?? '') : (cat.description_en ?? '')}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* NACE Categories */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        {i18n.language === 'fi' ? 'NACE-toimialat' : 'NACE Categories'}
      </Typography>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
        gap: 3 
      }}>
        {naceCategories.map((category, idx) => (
          <Card key={`${category.mainbusinessline ?? 'n'}-${idx}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 'bold' }} component="h3">
                {i18n.language === 'fi' ? (category.name ?? category.name_en ?? '') : (category.name_en ?? category.name ?? '')}
              </Typography>
              {category.mainbusinessline && (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {category.mainbusinessline}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

export default Categories; 