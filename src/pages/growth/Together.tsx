import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { TOGETHER_LINKS } from '@/components/Growth/togetherLinks';
import styles from '@/components/Growth/Growth.module.scss';

registerGrowthTranslations();

/** Hub for everything about meeting people and building things together. */
export const Together: React.FC = () => {
  const { t } = useTranslation('growth');

  useEffect(() => {
    registerGrowthTranslations();
  }, []);

  return (
    <div className={styles.container} data-reveal-children>
      <div className={styles.header}>
        <h1>{t('together.title', 'Together')}</h1>
        <p>{t('together.subtitle', 'Meet people, help each other, build something. Every step here is voluntary — pick what feels good.')}</p>
      </div>
      <div className={styles.grid3} data-reveal-children>
        {TOGETHER_LINKS.map((l) => (
          <Link key={l.to} to={l.to} className={`${styles.card} ${styles.hubCard}`} style={{ marginTop: 0 }}>
            <i className={l.icon} aria-hidden="true" />
            <span className={styles.itemTitle}>{t(`together.items.${l.key}.title`)}</span>
            <span className={styles.muted}>{t(`together.items.${l.key}.text`)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Together;
