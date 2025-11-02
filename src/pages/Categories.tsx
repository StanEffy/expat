import { useState, useEffect, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <ProgressSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
        <p style={{ color: 'red', marginTop: '32px' }}>{error}</p>
        <Button 
          label={t('common.tryAgain')}
          onClick={() => window.location.reload()}
          style={{ marginTop: '16px' }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ marginTop: '32px', marginBottom: '16px' }}>
        {t('categories.title')}
      </h1>

      {/* General Categories */}
      <h2 style={{ marginTop: '16px', marginBottom: '16px' }}>
        {i18n.language === 'fi' ? 'Yleiset toimialat' : 'General Categories'}
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {generalCategories.map((cat) => (
          <Card key={cat.id} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flexGrow: 1, padding: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                {i18n.language === 'fi' ? cat.name_fi : cat.name_en}
              </h3>
              {(cat.description_en || cat.description_fi) && (
                <p style={{ color: '#666', marginTop: '8px', marginBottom: 0 }}>
                  {i18n.language === 'fi' ? (cat.description_fi ?? '') : (cat.description_en ?? '')}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* NACE Categories */}
      <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>
        {i18n.language === 'fi' ? 'NACE-toimialat' : 'NACE Categories'}
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {naceCategories.map((category, idx) => (
          <Card key={`${category.mainbusinessline ?? 'n'}-${idx}`} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flexGrow: 1, padding: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>
                {i18n.language === 'fi' ? (category.name ?? category.name_en ?? '') : (category.name_en ?? category.name ?? '')}
              </h3>
              {category.mainbusinessline && (
                <p style={{ color: '#666', marginTop: '8px', marginBottom: 0 }}>
                  {category.mainbusinessline}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Categories; 