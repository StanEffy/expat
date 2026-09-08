import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DemographicDistribution } from '@/types/municipalAnalytics';
import styles from './DemographicsBreakdown.module.scss';

interface Props {
  demographics: DemographicDistribution;
}

export const DemographicsBreakdown: React.FC<Props> = ({ demographics }) => {
  const { t } = useTranslation('analytics');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          <i className="pi pi-users" />
          {t('demographics.title')}
        </h2>
      </div>

      <div className={styles.grid}>
        {/* Citizenship Categories */}
        <div className={styles.section}>
          <h3>
            <i className="pi pi-id-card" />
            {t('demographics.citizenship_origin')}
          </h3>
          <div className={styles.citizenshipStackedBar}>
            <div
              className={`${styles.stackedSegment} ${styles.eu}`}
              style={{ width: `${demographics.citizenship.eu}%` }}
              title={`EU / EEA: ${demographics.citizenship.eu}%`}
            />
            <div
              className={`${styles.stackedSegment} ${styles.nordic}`}
              style={{ width: `${demographics.citizenship.nordic}%` }}
              title={`Nordic: ${demographics.citizenship.nordic}%`}
            />
            <div
              className={`${styles.stackedSegment} ${styles.nonEu}`}
              style={{ width: `${demographics.citizenship.nonEu}%` }}
              title={`Non-EU: ${demographics.citizenship.nonEu}%`}
            />
          </div>

          <div className={styles.legendList}>
            <div className={styles.legendItem}>
              <div className={styles.dotLabel}>
                <span className={`${styles.dot} ${styles.eu}`} />
                <span>{t('demographics.eu')}</span>
              </div>
              <strong>{demographics.citizenship.eu}%</strong>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.dotLabel}>
                <span className={`${styles.dot} ${styles.nordic}`} />
                <span>{t('demographics.nordic')}</span>
              </div>
              <strong>{demographics.citizenship.nordic}%</strong>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.dotLabel}>
                <span className={`${styles.dot} ${styles.nonEu}`} />
                <span>{t('demographics.non_eu')}</span>
              </div>
              <strong>{demographics.citizenship.nonEu}%</strong>
            </div>
          </div>
        </div>

        {/* Top Source Nationalities */}
        <div className={styles.section}>
          <h3>
            <i className="pi pi-globe" />
            {t('demographics.top_countries')}
          </h3>
          <div className={styles.nationalitiesList}>
            {demographics.topNationalities.map((nat) => (
              <div key={nat.country} className={styles.nationalityItem}>
                <span className={styles.country}>{nat.country}</span>
                <div className={styles.numbers}>
                  <span className={styles.count}>{nat.count.toLocaleString()}</span>
                  <span className={styles.percentage}>{nat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Languages & Age Groups */}
        <div className={styles.section}>
          <h3>
            <i className="pi pi-comments" />
            {t('demographics.native_languages')}
          </h3>
          <div className={styles.chipsCloud} style={{ marginBottom: '1.25rem' }}>
            {demographics.nativeLanguages.map((lang) => (
              <span key={lang.language} className={styles.languageChip}>
                {lang.language} <strong>{lang.percentage}%</strong>
              </span>
            ))}
          </div>

          <h3>
            <i className="pi pi-calendar" />
            {t('demographics.age_distribution')}
          </h3>
          <div className={styles.ageBarsList}>
            {demographics.ageGroups.map((ag) => (
              <div key={ag.range} className={styles.ageBarRow}>
                <span className={styles.rangeLabel}>{ag.range}</span>
                <div className={styles.track}>
                  <div className={styles.fill} style={{ width: `${ag.percentage * 1.8}%` }} />
                </div>
                <span className={styles.percentLabel}>{ag.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsBreakdown;
