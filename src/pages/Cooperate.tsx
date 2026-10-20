import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerCoopTranslations } from '@/i18n/registerCoop';
import { useCoop, type CoopTab } from '@/hooks/useCoop';
import { useNotification } from '@/hooks/useNotification';
import { SegmentedControl } from '@/components/UI';
import { QuestionCard } from '@/components/Coop/QuestionCard';
import { MatchCard } from '@/components/Coop/MatchCard';
import type { CoopQuestion, SaveCoopAnswerPayload } from '@/types/coop';
import styles from './Cooperate.module.scss';

registerCoopTranslations();

export const Cooperate: React.FC = () => {
  const { t } = useTranslation('coop');
  const { showNotification } = useNotification();
  const [skippedIds, setSkippedIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isTogglingMatching, setIsTogglingMatching] = useState(false);

  useEffect(() => {
    registerCoopTranslations();
  }, []);

  const {
    activeTab,
    setActiveTab,
    questions,
    unansweredQuestions,
    answeredCount,
    profile,
    matches,
    isLoaded,
    isLoadingMatches,
    error,
    saveAnswer,
    clearAnswer,
    setMatchingEnabled,
    refreshMatches,
  } = useCoop();

  // Skipped questions go to the back of the queue instead of disappearing
  const currentQuestion = useMemo<CoopQuestion | undefined>(() => {
    const fresh = unansweredQuestions.filter((q) => !skippedIds.includes(q.id));
    if (fresh.length > 0) return fresh[0];
    return skippedIds.map((id) => unansweredQuestions.find((q) => q.id === id)).find(Boolean);
  }, [unansweredQuestions, skippedIds]);

  const answeredQuestions = useMemo(() => questions.filter((q) => q.my_answer), [questions]);

  const handleSave = async (questionId: number, payload: SaveCoopAnswerPayload) => {
    try {
      await saveAnswer(questionId, payload);
      setSkippedIds((prev) => prev.filter((id) => id !== questionId));
      setEditingId(null);
    } catch (err) {
      showNotification(err instanceof Error ? err.message : t('errors.save'), 'error');
    }
  };

  const handleClear = async (questionId: number) => {
    try {
      await clearAnswer(questionId);
      setEditingId(null);
    } catch (err) {
      showNotification(err instanceof Error ? err.message : t('errors.save'), 'error');
    }
  };

  const handleSkip = (questionId: number) => {
    setSkippedIds((prev) => [...prev.filter((id) => id !== questionId), questionId]);
  };

  const handleToggleMatching = async () => {
    setIsTogglingMatching(true);
    try {
      await setMatchingEnabled(!profile.matching_enabled);
    } catch {
      showNotification(t('errors.matching'), 'error');
    } finally {
      setIsTogglingMatching(false);
    }
  };

  const tabItems: { id: CoopTab; label: string; icon: string; count?: number }[] = [
    { id: 'questions', label: t('tabs.questions', 'Questions'), icon: 'pi pi-list-check', count: unansweredQuestions.length || undefined },
    { id: 'matches', label: t('tabs.matches', 'Matches'), icon: 'pi pi-users', count: matches.length || undefined },
  ];

  const answerTextFor = (q: CoopQuestion) => q.options.find((o) => o.id === q.my_answer?.option_id)?.text ?? '';

  if (!isLoaded) {
    return null;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <i className="pi pi-exclamation-circle" aria-hidden="true" />
          <p>{t('errors.load')}</p>
        </div>
      </div>
    );
  }

  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <h1>{t('title', 'Team Up')}</h1>
        <p>{t('subtitle')}</p>
      </div>

      <div className={`${styles.matchingPanel} ${profile.matching_enabled ? styles.matchingOn : ''}`}>
        <div className={styles.matchingText}>
          <h2>
            <i className={profile.matching_enabled ? 'pi pi-eye' : 'pi pi-eye-slash'} aria-hidden="true" />{' '}
            {profile.matching_enabled ? t('matching.on') : t('matching.title')}
          </h2>
          <p>{t('matching.description')}</p>
        </div>
        <button
          type="button"
          className={profile.matching_enabled ? styles.toggleOff : styles.toggleOn}
          onClick={handleToggleMatching}
          disabled={isTogglingMatching}
        >
          {profile.matching_enabled ? t('matching.disable') : t('matching.enable')}
        </button>
      </div>

      <div className={styles.tabNavigationWrapper}>
        <SegmentedControl
          items={tabItems}
          value={activeTab}
          onChange={(id) => setActiveTab(id)}
          mobileLayout="stack"
          ariaLabel={t('title')}
        />
      </div>

      {activeTab === 'questions' && (
        <div className={styles.questionsLayout}>
          <div className={styles.progress}>
            <div className={styles.progressLabel}>
              <span>{t('progress', { answered: answeredCount, total: questions.length })}</span>
              <span>{progress}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <p className={styles.hint}>{t('hint')}</p>
          </div>

          {currentQuestion ? (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              onSave={(payload) => handleSave(currentQuestion.id, payload)}
              onSkip={unansweredQuestions.length > 1 ? () => handleSkip(currentQuestion.id) : undefined}
            />
          ) : (
            <div className={styles.doneState}>
              <i className="pi pi-sparkles" aria-hidden="true" />
              <h2>{t('done.title')}</h2>
              <p>{t('done.text')}</p>
              <button type="button" className={styles.toggleOn} onClick={() => setActiveTab('matches')}>
                {t('tabs.matches')}
              </button>
            </div>
          )}

          {answeredQuestions.length > 0 && (
            <section className={styles.answeredSection}>
              <h2 className={styles.sectionTitle}>{t('answered.title')}</h2>
              <ul className={styles.answeredList}>
                {answeredQuestions.map((q) =>
                  editingId === q.id ? (
                    <li key={q.id}>
                      <QuestionCard
                        question={q}
                        onSave={(payload) => handleSave(q.id, payload)}
                        onCancel={() => setEditingId(null)}
                        onClear={() => handleClear(q.id)}
                      />
                    </li>
                  ) : (
                    <li key={q.id} className={styles.answeredItem}>
                      <div className={styles.answeredText}>
                        <span className={styles.answeredQuestion}>{q.text}</span>
                        <span className={styles.answeredAnswer}>
                          {answerTextFor(q)}
                          <span className={styles.importanceChip}>{t(`importance.${q.my_answer?.importance ?? 0}`)}</span>
                        </span>
                      </div>
                      <button type="button" className={styles.editButton} onClick={() => setEditingId(q.id)}>
                        <i className="pi pi-pencil" aria-hidden="true" /> {t('question.edit')}
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </section>
          )}
        </div>
      )}

      {activeTab === 'matches' && (
        <div>
          {!profile.matching_enabled ? (
            <div className={styles.emptyState}>
              <i className="pi pi-eye-slash" aria-hidden="true" />
              <h2>{t('matches.disabledTitle')}</h2>
              <p>{t('matches.disabledText')}</p>
              <button type="button" className={styles.toggleOn} onClick={handleToggleMatching} disabled={isTogglingMatching}>
                {t('matching.enable')}
              </button>
            </div>
          ) : isLoadingMatches ? (
            <div className={styles.emptyState}>
              <i className="pi pi-spin pi-spinner" aria-hidden="true" />
              <p>{t('matches.loading')}</p>
            </div>
          ) : matches.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="pi pi-users" aria-hidden="true" />
              <p>{t('matches.empty')}</p>
            </div>
          ) : (
            <>
              <div className={styles.matchesToolbar}>
                <button type="button" className={styles.editButton} onClick={() => void refreshMatches()}>
                  <i className="pi pi-refresh" aria-hidden="true" /> {t('matches.refresh')}
                </button>
              </div>
              <div className={styles.cardsGrid}>
                {matches.map((m) => (
                  <MatchCard key={m.user_id} match={m} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Cooperate;
