import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TalentSkillMetric } from '@/types/municipalAnalytics';
import styles from './TalentRadar.module.scss';

interface Props {
  skills: TalentSkillMetric[];
}

export const TalentRadar: React.FC<Props> = ({ skills }) => {
  const { t } = useTranslation('analytics');

  return (
    <div className={styles.radarContainer}>
      <div className={styles.header}>
        <h2>
          <i className="pi pi-bolt" />
          {t('skills.title')}
        </h2>
        <p>{t('skills.subtitle')}</p>
      </div>

      <div className={styles.skillsGrid}>
        {skills.map((skill) => (
          <div key={skill.name} className={styles.skillCard}>
            <div className={styles.topRow}>
              <div className={styles.skillInfo}>
                <h3>{skill.name}</h3>
                <span className={styles.targetIndustry}>
                  <i className="pi pi-briefcase" />
                  {skill.topIndustry}
                </span>
              </div>

              <div className={styles.badgesGroup}>
                <span className={styles.countBadge}>
                  {skill.count.toLocaleString()} talents
                </span>
                <span className={`${styles.demandBadge} ${styles[skill.localDemand]}`}>
                  {t(`skills.demand_${skill.localDemand}`)}
                </span>
              </div>
            </div>

            <div className={styles.barContainer}>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${skill.percentage * 2}%` }}
                />
              </div>
              <div className={styles.shareLabel}>
                <span>{t('skills.share')}</span>
                <strong>{skill.percentage}%</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TalentRadar;
