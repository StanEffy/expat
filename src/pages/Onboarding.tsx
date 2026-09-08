import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/Common/SEO';
import { registerOnboardingTranslations } from '@/i18n/registerOnboarding';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingWizard } from '@/components/Onboarding/OnboardingWizard';
import { OnboardingChecklist } from '@/components/Onboarding/OnboardingChecklist';
import styles from './Onboarding.module.scss';

// Ensure translations are available
registerOnboardingTranslations();

export const Onboarding: React.FC = () => {
  const { t } = useTranslation('onboarding');
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const {
    isLoaded,
    isConfigured,
    answers,
    tasks,
    allTasks,
    completedTaskIds,
    selectedPhase,
    selectedCategory,
    filterStatus,
    stats,
    setAnswers,
    toggleTask,
    resetWizard,
    setSelectedPhase,
    setSelectedCategory,
    setFilterStatus,
  } = useOnboarding();

  if (!isLoaded) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${t('title')} - Expat`}
        description={t('subtitle')}
        keywords="Finland expat onboarding, relocation Finland, DVV registration, Vero tax card, Kela health card, International House Helsinki, Tampere, Espoo, Vantaa, Turku, Oulu"
        url={currentUrl}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Guide',
          name: t('title'),
          description: t('subtitle'),
          url: currentUrl,
        }}
      />

      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.badge}>
            <i className="pi pi-building-columns" />
            <span>Municipal Relocation & Integration Service</span>
          </div>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>

        {!isConfigured || !answers ? (
          <OnboardingWizard initialAnswers={answers} onComplete={setAnswers} />
        ) : (
          <OnboardingChecklist
            answers={answers}
            tasks={tasks}
            allTasks={allTasks}
            completedTaskIds={completedTaskIds}
            stats={stats}
            selectedPhase={selectedPhase}
            selectedCategory={selectedCategory}
            filterStatus={filterStatus}
            onToggleTask={toggleTask}
            onReset={resetWizard}
            onSelectPhase={setSelectedPhase}
            onSelectCategory={setSelectedCategory}
            onSelectFilterStatus={setFilterStatus}
          />
        )}
      </div>
    </>
  );
};

export default Onboarding;
