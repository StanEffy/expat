import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MunicipalSentimentInsight } from '@/types/municipalAnalytics';
import styles from './SentimentInsights.module.scss';

interface Props {
  sentiment: MunicipalSentimentInsight;
}

export const SentimentInsights: React.FC<Props> = ({ sentiment }) => {
  const { t } = useTranslation('analytics');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>
          <i className="pi pi-heart" />
          {t('sentiment.title')}
        </h2>
        <p>{t('sentiment.subtitle')}</p>
      </div>

      <div className={styles.mainGrid}>
        {/* Score Card */}
        <div className={styles.scoreCard}>
          <span className={styles.scoreLabel}>{t('sentiment.nps_label')}</span>
          <div className={styles.bigScore}>{sentiment.satisfactionScore}</div>
          <div className={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={
                  star <= Math.round(sentiment.satisfactionScore)
                    ? 'pi pi-star-fill'
                    : 'pi pi-star'
                }
              />
            ))}
          </div>
          <p className={styles.responsesCount}>
            {sentiment.totalSurveyResponses.toLocaleString()} {t('sentiment.responses_count')}
          </p>
        </div>

        {/* Top Pain Points */}
        <div className={styles.section}>
          <h3 className={styles.pain}>
            <i className="pi pi-exclamation-triangle" />
            {t('sentiment.pain_points')}
          </h3>
          <div className={styles.itemsList}>
            {sentiment.topPainPoints.map((item) => (
              <div key={item.issueKey} className={styles.itemCard}>
                <p>{t(item.issueKey.replace(/^analytics\./, ''))}</p>
                <span className={`${styles.voteCount} ${styles[item.severity]}`}>
                  {item.count} mentions
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top City Attractions */}
        <div className={styles.section}>
          <h3 className={styles.attract}>
            <i className="pi pi-thumbs-up" />
            {t('sentiment.attractions')}
          </h3>
          <div className={styles.itemsList}>
            {sentiment.topAttractions.map((item) => (
              <div key={item.factorKey} className={styles.itemCard}>
                <p>{t(item.factorKey.replace(/^analytics\./, ''))}</p>
                <span className={`${styles.voteCount} ${styles.positive}`}>
                  +{item.count} votes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentInsights;
