import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerDeadlinesTranslations } from '@/i18n/registerDeadlines';
import styles from '@/components/Growth/Growth.module.scss';

registerDeadlinesTranslations();

/** Pointer to "My deadlines" from the relocation guide */
export const DeadlinesPromo: React.FC = () => {
  const { t } = useTranslation('deadlines');
  return (
    <Link to="/deadlines" className={`${styles.card} ${styles.hubCard}`} style={{ marginBottom: '1.5rem' }}>
      <i className="pi pi-calendar-clock" aria-hidden="true" />
      <span className={styles.itemTitle}>{t('promo.title')}</span>
      <span className={styles.muted}>{t('promo.text')}</span>
    </Link>
  );
};
