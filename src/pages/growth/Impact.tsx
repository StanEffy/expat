import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { ImpactPanel } from '@/components/Growth/ImpactPanel';
import { CITY_IDS, CITY_NAMES } from '@/components/Growth/shared';
import styles from '@/components/Growth/Growth.module.scss';

registerGrowthTranslations();

/** Public page for cities and funders: what the platform measurably changes. */
export const Impact: React.FC = () => {
  const { t } = useTranslation('growth');
  const [city, setCity] = useState('');

  useEffect(() => {
    registerGrowthTranslations();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t('impact.title', 'Measured impact')}</h1>
        <p>{t('impact.subtitle', 'What changes for people who use EXPAT — integration, real-world ties, companies founded and mutual help. Anonymous and live.')}</p>
      </div>
      <div className={styles.actions} style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
        <select className={styles.input} style={{ width: 'auto' }} value={city} onChange={(e) => setCity(e.target.value)} aria-label={t('common.city', 'City')}>
          <option value="">{t('common.allCities', 'All cities')}</option>
          {CITY_IDS.map((c) => <option key={c} value={c}>{CITY_NAMES[c]}</option>)}
        </select>
      </div>
      <ImpactPanel municipality={city} />
    </div>
  );
};

export default Impact;
