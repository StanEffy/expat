import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { coopService } from '@/services/coopService';
import type { CoopMatch, CoopProfile, CoopQuestion, SaveCoopAnswerPayload } from '@/types/coop';

export type CoopTab = 'questions' | 'matches';

const EMPTY_PROFILE: CoopProfile = { matching_enabled: false, answered_count: 0, total_questions: 0 };

export function useCoop() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const [activeTab, setActiveTab] = useState<CoopTab>('questions');
  const [questions, setQuestions] = useState<CoopQuestion[]>([]);
  const [profile, setProfile] = useState<CoopProfile>(EMPTY_PROFILE);
  const [matches, setMatches] = useState<CoopMatch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([coopService.getQuestions(lang), coopService.getProfile()])
      .then(([q, p]) => {
        if (cancelled) return;
        setQuestions(q);
        setProfile(p);
        setError(null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const refreshMatches = useCallback(async () => {
    setIsLoadingMatches(true);
    try {
      setMatches(await coopService.getMatches(lang));
    } catch (err) {
      console.warn('Failed to load matches', err);
      setMatches([]);
    } finally {
      setIsLoadingMatches(false);
    }
  }, [lang]);

  useEffect(() => {
    if (activeTab === 'matches' && profile.matching_enabled) {
      void refreshMatches();
    }
  }, [activeTab, profile.matching_enabled, refreshMatches]);

  const saveAnswer = useCallback(async (questionId: number, payload: SaveCoopAnswerPayload) => {
    await coopService.saveAnswer(questionId, payload);
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, my_answer: { question_id: questionId, ...payload } } : q)),
    );
  }, []);

  const clearAnswer = useCallback(async (questionId: number) => {
    await coopService.deleteAnswer(questionId);
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, my_answer: undefined } : q)));
  }, []);

  const setMatchingEnabled = useCallback(async (enabled: boolean) => {
    const updated = await coopService.setMatchingEnabled(enabled);
    setProfile(updated);
    if (!enabled) setMatches([]);
  }, []);

  const unansweredQuestions = useMemo(() => questions.filter((q) => !q.my_answer), [questions]);
  const answeredCount = questions.length - unansweredQuestions.length;

  return {
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
  };
}
