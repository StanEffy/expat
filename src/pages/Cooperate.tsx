import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerCoopTranslations } from '@/i18n/registerCoop';
import { useCoop, type CoopTab } from '@/hooks/useCoop';
import { useNotification } from '@/hooks/useNotification';
import { SegmentedControl } from '@/components/UI';
import { QuestionCard } from '@/components/Coop/QuestionCard';
import { MatchCard, type IntroState } from '@/components/Coop/MatchCard';
import { Dialog } from 'primereact/dialog';
import { networkService, experimentsService } from '@/services/growthService';
import type { CoopIntro } from '@/types/growth';
import { getUserId } from '@/utils/auth';
import type { CoopMatch, CoopQuestion, SaveCoopAnswerPayload } from '@/types/coop';
import styles from './Cooperate.module.scss';

registerCoopTranslations();

export const Cooperate: React.FC = () => {
  const { t } = useTranslation('coop');
  const { showNotification } = useNotification();
  const [skippedIds, setSkippedIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isTogglingMatching, setIsTogglingMatching] = useState(false);
  const [intros, setIntros] = useState<CoopIntro[]>([]);
  const [introVariant, setIntroVariant] = useState('');
  const [introFor, setIntroFor] = useState<CoopMatch | null>(null);
  const [introMessage, setIntroMessage] = useState('');
  const [sendingIntro, setSendingIntro] = useState(false);

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

  useEffect(() => {
    if (activeTab !== 'matches' || !profile.matching_enabled) return;
    networkService.intros().then(setIntros).catch(() => undefined);
    experimentsService.variant('coop_intro_prompt').then((r) => setIntroVariant(r.variant)).catch(() => undefined);
  }, [activeTab, profile.matching_enabled]);

  const me = getUserId();
  const introState = (userId: number): IntroState => {
    const intro = intros.find((i) => (i.from_user_id === me && i.to_user_id === userId) || (i.to_user_id === me && i.from_user_id === userId));
    return intro ? intro.status : 'none';
  };

  const openIntro = (match: CoopMatch) => {
    setIntroFor(match);
    // Experiment coop_intro_prompt: half of the users get a suggested first message
    const topics = match.agreements.slice(0, 2).map((a) => `"${a.text}"`).join(t('intro.and'));
    setIntroMessage(introVariant === 'suggested_message'
      ? (topics ? t('intro.suggested', { topics }) : t('intro.suggestedGeneric'))
      : '');
    void experimentsService.track('coop_intro_prompt', 'intro_dialog_opened').catch(() => undefined);
  };

  const sendIntro = async () => {
    if (!introFor) return;
    setSendingIntro(true);
    try {
      await networkService.sendIntro(introFor.user_id, introMessage);
      setIntros(await networkService.intros().catch(() => intros));
      showNotification(t('intro.sent'), 'success');
      setIntroFor(null);
    } catch (err) {
      showNotification(err instanceof Error ? err.message : t('intro.error'), 'error');
    } finally {
      setSendingIntro(false);
    }
  };

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
                  <MatchCard key={m.user_id} match={m} introState={introState(m.user_id)} onIntro={() => openIntro(m)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <Dialog
        header={introFor ? t('intro.title', { name: introFor.name }) : ''}
        visible={introFor !== null}
        onHide={() => setIntroFor(null)}
        style={{ width: '92vw', maxWidth: '520px' }}
        modal
      >
        <p className={styles.introHint}>{t('intro.hint')}</p>
        <textarea
          className={styles.introText}
          rows={5}
          maxLength={1000}
          value={introMessage}
          placeholder={t('intro.placeholder')}
          onChange={(e) => setIntroMessage(e.target.value)}
          aria-label={t('intro.placeholder')}
        />
        <button type="button" className={styles.toggleOn} onClick={sendIntro} disabled={sendingIntro}>
          {sendingIntro ? <i className="pi pi-spin pi-spinner" /> : t('intro.send')}
        </button>
      </Dialog>
    </div>
  );
};

export default Cooperate;
