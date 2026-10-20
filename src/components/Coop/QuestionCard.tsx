import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CoopImportance, CoopQuestion, SaveCoopAnswerPayload } from '@/types/coop';
import styles from './QuestionCard.module.scss';

const IMPORTANCE_LEVELS: CoopImportance[] = [0, 1, 2, 3, 4];

export interface QuestionCardProps {
  question: CoopQuestion;
  onSave: (payload: SaveCoopAnswerPayload) => Promise<void>;
  onSkip?: () => void;
  onCancel?: () => void;
  onClear?: () => Promise<void>;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onSave, onSkip, onCancel, onClear }) => {
  const { t } = useTranslation('coop');
  const existing = question.my_answer;

  const [optionId, setOptionId] = useState<number | null>(existing?.option_id ?? null);
  const [acceptable, setAcceptable] = useState<Set<number>>(new Set(existing?.acceptable_option_ids ?? []));
  const [importance, setImportance] = useState<CoopImportance>(existing?.importance ?? 2);
  const [isSaving, setIsSaving] = useState(false);

  const pickOwnAnswer = (id: number) => {
    setOptionId(id);
    // Most people accept their own answer, so pre-select it the first time
    if (acceptable.size === 0) {
      setAcceptable(new Set([id]));
    }
  };

  const toggleAcceptable = (id: number) => {
    setAcceptable((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (optionId === null) return;
    setIsSaving(true);
    try {
      await onSave({ option_id: optionId, acceptable_option_ids: Array.from(acceptable), importance });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!onClear) return;
    setIsSaving(true);
    try {
      await onClear();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.card}>
      <span className={`${styles.category} ${styles[question.category] || ''}`}>
        {t(`categories.${question.category}`, question.category)}
      </span>
      <h2 className={styles.questionText}>{question.text}</h2>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('question.yourAnswer', 'Your answer')}</h3>
        <div className={styles.options} role="radiogroup" aria-label={t('question.yourAnswer', 'Your answer')}>
          {question.options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={optionId === option.id}
              className={`${styles.option} ${optionId === option.id ? styles.selected : ''}`}
              onClick={() => pickOwnAnswer(option.id)}
            >
              {option.text}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('question.importance', 'How important is this to you?')}</h3>
        <div className={styles.importance} role="radiogroup" aria-label={t('question.importance')}>
          {IMPORTANCE_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={importance === level}
              className={`${styles.importanceItem} ${importance === level ? styles.selected : ''}`}
              onClick={() => setImportance(level)}
            >
              {t(`importance.${level}`)}
            </button>
          ))}
        </div>
      </section>

      {importance > 0 && optionId !== null && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{t('question.acceptable', 'Answers you accept from a partner')}</h3>
          <p className={styles.sectionHint}>{t('question.acceptableHint', 'Pick everything that works for you')}</p>
          <div className={styles.options}>
            {question.options.map((option) => (
              <label key={option.id} className={`${styles.checkOption} ${acceptable.has(option.id) ? styles.checked : ''}`}>
                <input
                  type="checkbox"
                  checked={acceptable.has(option.id)}
                  onChange={() => toggleAcceptable(option.id)}
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        </section>
      )}

      <div className={styles.actions}>
        {onClear && existing && (
          <button type="button" className={styles.linkButton} onClick={handleClear} disabled={isSaving}>
            {t('question.clear', 'Remove answer')}
          </button>
        )}
        <div className={styles.actionsRight}>
          {onSkip && (
            <button type="button" className={styles.secondaryButton} onClick={onSkip} disabled={isSaving}>
              {t('question.skip', 'Skip')}
            </button>
          )}
          {onCancel && (
            <button type="button" className={styles.secondaryButton} onClick={onCancel} disabled={isSaving}>
              {t('question.cancel', 'Cancel')}
            </button>
          )}
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleSave}
            disabled={optionId === null || isSaving}
          >
            {isSaving ? <i className="pi pi-spin pi-spinner" aria-hidden="true" /> : t('question.save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
