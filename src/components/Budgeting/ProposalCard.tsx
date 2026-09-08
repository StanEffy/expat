import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import type { BudgetProposal } from '@/types/budgeting';
import styles from './ProposalCard.module.scss';

interface Props {
  proposal: BudgetProposal;
  userVotes: number;
  canVote: boolean;
  onVote: (id: string) => void;
  onWithdraw: (id: string) => void;
}

export const ProposalCard: React.FC<Props> = ({
  proposal,
  userVotes,
  canVote,
  onVote,
  onWithdraw,
}) => {
  const { t } = useTranslation('budgeting');

  const normalizedId = (proposal.id || '').replace(/-/g, '_');
  const cleanTitleKey = proposal.titleKey?.replace(/^budgeting\./, '') || `proposals.${normalizedId}.title`;
  const cleanDescKey = proposal.descriptionKey?.replace(/^budgeting\./, '') || `proposals.${normalizedId}.description`;

  const fallbackTitle = 'title' in proposal && typeof (proposal as Record<string, unknown>).title === 'string'
    ? (proposal as Record<string, unknown>).title as string
    : proposal.id;
  const fallbackDesc = 'description' in proposal && typeof (proposal as Record<string, unknown>).description === 'string'
    ? (proposal as Record<string, unknown>).description as string
    : '';

  const title = t(`proposals.${normalizedId}.title`, {
    defaultValue: t(cleanTitleKey, {
      defaultValue: fallbackTitle,
    }),
  });

  const description = t(`proposals.${normalizedId}.description`, {
    defaultValue: t(cleanDescKey, {
      defaultValue: fallbackDesc,
    }),
  });

  const categoryLabel = t(`filters.categories.${proposal.category}`, proposal.category);

  const progressPercent = Math.min(100, Math.round((proposal.votesCount / proposal.targetVotes) * 100));
  const isFunded = proposal.status === 'funded' || proposal.votesCount >= proposal.targetVotes;

  const getCategorySeverity = (category: string) => {
    switch (category) {
      case 'environment_parks':
        return 'success';
      case 'culture_events':
        return 'warning';
      case 'integration_language':
        return 'info';
      case 'sports_outdoor':
        return 'danger';
      default:
        return undefined;
    }
  };

  return (
    <div className={`${styles.card} ${isFunded ? styles.funded : ''}`}>
      <div>
        <div className={styles.header}>
          <div className={styles.badgeRow}>
            <Tag value={categoryLabel} severity={getCategorySeverity(proposal.category)} />
            <Tag value={proposal.district} severity="info" />
            {isFunded ? (
              <Tag value={t('proposal.funded_badge', 'Funded! 🎉')} severity="success" icon="pi pi-check" />
            ) : (
              <Tag value={t('proposal.active_badge', 'Voting Open')} severity="warning" />
            )}
          </div>
          <h4 className={styles.title}>{title}</h4>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.label}>{t('proposal.budget_needed', 'Required Budget')}</span>
            <span className={styles.value}>€{proposal.requiredBudget.toLocaleString()}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.label}>{t('proposal.votes', 'Votes')}</span>
            <span className={styles.value}>
              {proposal.votesCount} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'rgba(255, 255, 255, 0.5)' }}>/ {proposal.targetVotes}</span>
            </span>
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span>{t('proposal.votes', 'Votes')}</span>
            <span>{progressPercent}%</span>
          </div>
          <ProgressBar
            value={progressPercent}
            showValue={false}
            className={styles.proposalProgressBar}
            style={{ height: '8px' }}
          />
        </div>
      </div>

      <div className={styles.footer}>
        <div>
          {userVotes > 0 && (
            <span className={styles.myVotesBadge}>
              <i className="pi pi-check-circle" />
              {t('proposal.your_votes', 'Your votes:')} {userVotes}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          {userVotes > 0 && (
            <Button
              icon="pi pi-minus"
              tooltip={t('proposal.withdraw_vote', 'Withdraw Vote')}
              severity="secondary"
              outlined
              size="small"
              onClick={() => onWithdraw(proposal.id)}
            />
          )}

          <Button
            label={t('proposal.cast_vote', 'Vote for Project')}
            icon="pi pi-thumbs-up"
            size="small"
            disabled={!canVote}
            onClick={() => onVote(proposal.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default ProposalCard;
