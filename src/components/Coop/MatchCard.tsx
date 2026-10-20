import React from 'react';
import { useTranslation } from 'react-i18next';
import type { CoopMatch } from '@/types/coop';
import styles from './MatchCard.module.scss';

export interface MatchCardProps {
  match: CoopMatch;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { t } = useTranslation('coop');

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div
          className={styles.score}
          style={{ '--score': `${match.score}%` } as React.CSSProperties}
          aria-label={`${match.score}%`}
        >
          <span>{match.score}%</span>
        </div>
        <div className={styles.identity}>
          <h3 className={styles.name}>{match.name}</h3>
          <p className={styles.meta}>{t('matches.common', { count: match.common_questions })}</p>
          {match.dealbreakers > 0 && (
            <span className={styles.dealbreaker}>
              <i className="pi pi-exclamation-triangle" aria-hidden="true" /> {t('matches.dealbreaker')}
            </span>
          )}
        </div>
      </div>

      {match.agreements.length > 0 && (
        <div className={styles.reasons}>
          <h4 className={styles.reasonsTitle}>
            <i className="pi pi-check-circle" aria-hidden="true" /> {t('matches.agree')}
          </h4>
          <ul>
            {match.agreements.map((r) => (
              <li key={r.question_id}>{r.text}</li>
            ))}
          </ul>
        </div>
      )}

      {match.conflicts.length > 0 && (
        <div className={`${styles.reasons} ${styles.conflicts}`}>
          <h4 className={styles.reasonsTitle}>
            <i className="pi pi-comments" aria-hidden="true" /> {t('matches.differ')}
          </h4>
          <ul>
            {match.conflicts.map((r) => (
              <li key={r.question_id}>{r.text}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
};

export default MatchCard;
