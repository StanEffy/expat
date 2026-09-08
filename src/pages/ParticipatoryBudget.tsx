import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'primereact/dropdown';
import { registerBudgetingTranslations } from '@/i18n/registerBudgeting';
import { useParticipatoryBudgeting } from '@/hooks/useParticipatoryBudgeting';
import { WalletCard } from '@/components/Budgeting/WalletCard';
import { ProposalCard } from '@/components/Budgeting/ProposalCard';
import type { MunicipalityId } from '@/types/onboarding';
import type { ProposalCategory } from '@/types/budgeting';
import styles from './ParticipatoryBudget.module.scss';

registerBudgetingTranslations();

export const ParticipatoryBudget: React.FC = () => {
  const { t } = useTranslation('budgeting');

  useEffect(() => {
    registerBudgetingTranslations();
  }, []);

  const {
    isLoaded,
    wallet,
    proposals,
    selectedCity,
    selectedCategory,
    usedTokens,
    remainingTokens,
    castVote,
    withdrawVote,
    resetVotes,
    setCity,
    setCategory,
  } = useParticipatoryBudgeting();

  const cityOptions: { label: string; value: MunicipalityId | 'all' }[] = [
    { label: t('filters.city_all', 'All Cities'), value: 'all' },
    { label: 'Helsinki', value: 'helsinki' },
    { label: 'Espoo', value: 'espoo' },
    { label: 'Tampere', value: 'tampere' },
    { label: 'Vantaa', value: 'vantaa' },
    { label: 'Turku', value: 'turku' },
    { label: 'Oulu', value: 'oulu' },
  ];

  const categoryOptions: { label: string; value: ProposalCategory | 'all' }[] = [
    { label: t('filters.category_all', 'All Categories'), value: 'all' },
    { label: t('filters.categories.environment_parks', 'Parks & Nature'), value: 'environment_parks' },
    { label: t('filters.categories.culture_events', 'Culture & Festivals'), value: 'culture_events' },
    { label: t('filters.categories.integration_language', 'Language & Integration'), value: 'integration_language' },
    { label: t('filters.categories.sports_outdoor', 'Sports & Saunas'), value: 'sports_outdoor' },
    { label: t('filters.categories.children_youth', 'Children & Youth'), value: 'children_youth' },
    { label: t('filters.categories.cycling_transit', 'Cycling & Transit'), value: 'cycling_transit' },
  ];

  if (!isLoaded) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1>{t('title', 'Participatory Budgeting & Citizen Voting')}</h1>
        <p>{t('subtitle', 'Decide how municipal tax funds are invested in expat integration, green spaces, and community culture')}</p>
      </div>

      <WalletCard
        totalTokens={wallet.totalTokens}
        remainingTokens={remainingTokens}
        usedTokens={usedTokens}
        onReset={resetVotes}
      />

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="city-select">City:</label>
          <Dropdown
            id="city-select"
            value={selectedCity}
            options={cityOptions}
            onChange={(e) => setCity(e.value)}
            placeholder="Select a City"
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="category-select">Category:</label>
          <Dropdown
            id="category-select"
            value={selectedCategory}
            options={categoryOptions}
            onChange={(e) => setCategory(e.value)}
            placeholder="Select Category"
          />
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="pi pi-inbox" />
          <h3>No proposals match your filters</h3>
          <p>Try selecting another municipality or category to view available projects.</p>
        </div>
      ) : (
        <div className={styles.proposalsGrid}>
          {proposals.map((proposal) => {
            const userVotes = wallet.allocatedVotes[proposal.id] || 0;
            const canVote = remainingTokens > 0;
            return (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                userVotes={userVotes}
                canVote={canVote}
                onVote={castVote}
                onWithdraw={withdrawVote}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParticipatoryBudget;
