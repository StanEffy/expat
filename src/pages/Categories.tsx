import { useState, useEffect, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../contexts/NotificationContext';
import { getAuthHeaders } from '../utils/auth';
import { CATEGORY_ENDPOINTS } from '../constants/api';
import styles from './Categories.module.scss';

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
      if (!headers) {
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
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <ProgressSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>{error}</p>
        <Button 
          label={t('common.tryAgain')}
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {t('categories.title')}
      </h1>

      {/* General Categories */}
      <h2 className={styles.sectionTitle}>
        {i18n.language === 'fi' ? 'Yleiset toimialat' : 'General Categories'}
      </h2>
      <div className={styles.grid}>
        {generalCategories.map((cat) => (
          <Card key={cat.id} className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                {i18n.language === 'fi' ? cat.name_fi : cat.name_en}
              </h3>
              {(cat.description_en || cat.description_fi) && (
                <p className={styles.cardDescription}>
                  {i18n.language === 'fi' ? (cat.description_fi ?? '') : (cat.description_en ?? '')}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* NACE Categories */}
      <h2 className={styles.sectionTitleLarge}>
        {i18n.language === 'fi' ? 'NACE-toimialat' : 'NACE Categories'}
      </h2>
      <div className={styles.grid}>
        {naceCategories.map((category, idx) => (
          <Card key={`${category.mainbusinessline ?? 'n'}-${idx}`} className={styles.card}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>
                {i18n.language === 'fi' ? (category.name ?? category.name_en ?? '') : (category.name_en ?? category.name ?? '')}
              </h3>
              {category.mainbusinessline && (
                <p className={styles.cardDescription}>
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