import React from 'react';
import { useTranslation } from 'react-i18next';
import type { IntegrationBottleneckStep } from '@/types/municipalAnalytics';
import styles from './IntegrationFunnel.module.scss';

interface Props {
  funnelSteps: IntegrationBottleneckStep[];
}

export const IntegrationFunnel: React.FC<Props> = ({ funnelSteps }) => {
  const { t } = useTranslation('analytics');

  return (
    <div className={styles.funnelContainer}>
      <div className={styles.header}>
        <h2>
          <i className="pi pi-filter" />
          {t('funnel.title')}
        </h2>
        <p>{t('funnel.subtitle')}</p>
      </div>

      <div className={styles.stepsList}>
        {funnelSteps.map((step) => (
          <div
            key={step.id}
            className={`${styles.stepItem} ${styles[step.severity]}`}
          >
            <div className={styles.stepTopRow}>
              <div className={styles.stepTitleGroup}>
                <h3>{t(step.titleKey.replace(/^analytics\./, ''))}</h3>
                <span className={styles.department}>{step.department}</span>
              </div>

              <div className={styles.metricsGroup}>
                <div className={styles.durationBadge}>
                  <span>Avg: </span>
                  <strong>{step.avgProcessingDays} days</strong>
                  <span className={styles.benchmark}>(Goal: {step.benchmarkDays}d)</span>
                </div>
                <span className={`${styles.severityBadge} ${styles[step.severity]}`}>
                  {t(`funnel.status_${step.severity}`)}
                </span>
              </div>
            </div>

            <div className={styles.progressArea}>
              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressBar} ${styles[step.severity]}`}
                  style={{ width: `${step.completionRate}%` }}
                />
              </div>
              <div className={styles.completionLabel}>
                <span>{t('funnel.completion')}</span>
                <strong>{step.completionRate}%</strong>
              </div>
            </div>

            <p className={styles.insightText}>{t(step.insightKey.replace(/^analytics\./, ''))}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationFunnel;
