import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { integrationService } from '@/services/growthService';
import { useNotification } from '@/hooks/useNotification';
import type { IntegrationDimension, IntegrationPulse, IntegrationPulseAnswers, IntegrationPulseStatus } from '@/types/growth';
import { CITY_IDS, CITY_NAMES, errorText, formatDate } from '@/components/Growth/shared';
import styles from '@/components/Growth/Growth.module.scss';
import local from './Integration.module.scss';

registerGrowthTranslations();

type ItemKey = keyof IntegrationPulseAnswers;

interface Step {
  key: ItemKey;
  optional?: boolean;
  /** option values in display order; labels come from i18n `integration.options.<key>.<value>` */
  values: (number | string)[];
}

// IPL-12 (Immigration Policy Lab) adapted to Finland, plus intention to stay
const STEPS: Step[] = [
  { key: 'municipality_id', values: [...CITY_IDS, 'other'] },
  { key: 'target_language', values: ['fi', 'sv'] },
  { key: 'connection', values: [5, 4, 3, 2, 1] },
  { key: 'outsider', values: [5, 4, 3, 2, 1] },
  { key: 'see_doctor', values: [1, 2, 3, 4, 5] },
  { key: 'search_job', values: [1, 2, 3, 4, 5] },
  { key: 'dinner', values: [1, 2, 3, 4, 5] },
  { key: 'contacts', values: [1, 2, 3, 4, 5] },
  { key: 'pol_understanding', values: [5, 4, 3, 2, 1] },
  { key: 'pol_discuss', values: [1, 2, 3, 4, 5] },
  { key: 'read_lang', values: [5, 4, 3, 2, 1] },
  { key: 'speak_lang', values: [5, 4, 3, 2, 1] },
  { key: 'work_status', values: [1, 2, 9, 3, 4, 5, 6, 7, 8, 10] },
  { key: 'household_size', optional: true, values: [1, 2, 3, 4, 5, 6, 7, 8] },
  { key: 'household_income', optional: true, values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { key: 'stay_intention', optional: true, values: [5, 4, 3, 2, 1] },
];

const DIMENSIONS: IntegrationDimension[] = ['psychological', 'social', 'linguistic', 'navigational', 'political', 'economic'];

const DIMENSION_ICONS: Record<IntegrationDimension, string> = {
  psychological: 'pi pi-heart',
  social: 'pi pi-users',
  linguistic: 'pi pi-comments',
  navigational: 'pi pi-compass',
  political: 'pi pi-building-columns',
  economic: 'pi pi-briefcase',
};

const EMPTY: Partial<IntegrationPulseAnswers> = { share_for_statistics: false };

export const Integration: React.FC = () => {
  const { t, i18n } = useTranslation('growth');
  const { showNotification } = useNotification();
  const [status, setStatus] = useState<IntegrationPulseStatus | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [taking, setTaking] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<IntegrationPulseAnswers>>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    registerGrowthTranslations();
    integrationService
      .getStatus()
      .then(setStatus)
      .catch(() => setLoadError(true));
  }, []);

  const latest = status?.history[0];
  const previous = status?.history[1];
  const onConsentStep = stepIndex >= STEPS.length;
  const step = STEPS[Math.min(stepIndex, STEPS.length - 1)];

  const choose = (value: number | string | null) => {
    setAnswers((prev) => ({ ...prev, [step.key]: value }));
    setStepIndex((i) => i + 1);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...answers,
        municipality_id: answers.municipality_id === 'other' ? null : answers.municipality_id ?? null,
        household_income: answers.household_income ?? null,
        household_size: answers.household_size ?? null,
        stay_intention: answers.stay_intention ?? null,
      } as IntegrationPulseAnswers;
      const pulse = await integrationService.submit(payload);
      setStatus(await integrationService.getStatus().catch(() => ({
        history: [pulse, ...(status?.history ?? [])],
        can_submit: false,
      })));
      setTaking(false);
      setStepIndex(0);
      setAnswers(EMPTY);
      showNotification(t('integration.saved', 'Saved. See you at the next check-in!'), 'success');
    } catch (err) {
      showNotification(errorText(err, t('integration.saveError', 'Could not save your answers')), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const optionLabel = (key: ItemKey, value: number | string) => {
    if (key === 'municipality_id' && value !== 'other') return CITY_NAMES[value as string];
    if (key === 'household_size') {
      return value === 8 ? t('integration.options.household_size.8', '8 or more') : String(value);
    }
    return t(`integration.options.${key}.${value}`);
  };

  const questionText = (key: ItemKey) => {
    const lang = answers.target_language === 'sv'
      ? t('integration.swedish', 'Swedish')
      : t('integration.finnish', 'Finnish');
    return t(`integration.questions.${key}`, { language: lang });
  };

  const change = (dimension: IntegrationDimension): number | null => {
    if (!latest || !previous) return null;
    const a = latest[dimension];
    const b = previous[dimension];
    if (a === undefined || b === undefined) return null;
    return Math.round((a - b) * 100);
  };

  const history = useMemo(() => status?.history ?? [], [status]);

  if (loadError) {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.emptyState}`}>
          <i className="pi pi-exclamation-circle" />
          {t('common.loadError', 'Could not load this page. Please try again later.')}
        </div>
      </div>
    );
  }
  if (!status) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t('integration.title', 'Your settling-in map')}</h1>
        <p>{t('integration.subtitle', 'Twelve short questions, once in a while. You see how you are finding your feet in Finland, branch by branch.')}</p>
      </div>

      {taking ? (
        <div className={`${styles.card} ${local.quiz}`}>
          <div className={local.progressLabel}>
            <span>{t('integration.step', { current: Math.min(stepIndex + 1, STEPS.length + 1), total: STEPS.length + 1 })}</span>
            <button type="button" className={local.linkButton} onClick={() => { setTaking(false); setStepIndex(0); }}>
              {t('common.cancel', 'Cancel')}
            </button>
          </div>
          <div className={local.progressTrack}>
            <div className={local.progressFill} style={{ width: `${(stepIndex / (STEPS.length + 1)) * 100}%` }} />
          </div>

          {!onConsentStep ? (
            <>
              <h2 className={local.question}>{questionText(step.key)}</h2>
              {step.key === 'household_income' && (
                <p className={styles.muted}>{t('integration.incomeHint', 'Monthly take-home income of your whole household, after taxes. Optional.')}</p>
              )}
              <div className={local.options}>
                {step.values.map((value) => (
                  <button
                    key={String(value)}
                    type="button"
                    className={`${local.option} ${answers[step.key] === value ? local.selected : ''}`}
                    onClick={() => choose(value)}
                  >
                    {optionLabel(step.key, value)}
                  </button>
                ))}
              </div>
              <div className={local.navRow}>
                {stepIndex > 0 && (
                  <button type="button" className={styles.secondaryButton} onClick={() => setStepIndex((i) => i - 1)}>
                    <i className="pi pi-arrow-left" /> {t('common.back', 'Back')}
                  </button>
                )}
                {step.optional && (
                  <button type="button" className={styles.secondaryButton} onClick={() => choose(null)}>
                    {t('integration.preferNot', 'Prefer not to say')}
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h2 className={local.question}>{t('integration.consentTitle', 'Almost done')}</h2>
              <p className={styles.muted}>{t('integration.privacy', 'Your answers are private: nobody else sees them, not even other users or employers.')}</p>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={answers.share_for_statistics ?? false}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, share_for_statistics: e.target.checked }))}
                />
                <span>{t('integration.consent', 'Count my answers in anonymous city statistics (only shown for groups of at least 10 people). This helps cities see what works.')}</span>
              </label>
              <div className={local.navRow}>
                <button type="button" className={styles.secondaryButton} onClick={() => setStepIndex((i) => i - 1)}>
                  <i className="pi pi-arrow-left" /> {t('common.back', 'Back')}
                </button>
                <button type="button" className={styles.primaryButton} onClick={submit} disabled={submitting}>
                  {submitting ? <i className="pi pi-spin pi-spinner" /> : t('integration.submit', 'See my map')}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <div className={`${styles.card} ${latest ? styles.highlight : ''}`}>
            {latest ? (
              <>
                <h2 className={styles.cardTitle}>
                  <i className="pi pi-map" /> {t('integration.latestTitle', 'Your map')}
                  <span className={styles.chip}>{formatDate(latest.created_at, i18n.language)}</span>
                </h2>
                {latest.ipl_score !== undefined && latest.ipl_score !== null && (
                  <p className={styles.cardSubtitle}>
                    {t('integration.overall', 'Overall integration index')}: <strong>{Math.round(latest.ipl_score * 100)} / 100</strong>
                  </p>
                )}
                <div className={styles.bars}>
                  {DIMENSIONS.map((d) => {
                    const value = latest[d];
                    const delta = change(d);
                    return (
                      <div key={d} className={styles.barRow}>
                        <span>
                          <i className={DIMENSION_ICONS[d]} /> {t(`integration.dimensions.${d}`)}
                        </span>
                        <div className={styles.barTrack}>
                          <div className={styles.barFill} style={{ width: `${(value ?? 0) * 100}%` }} />
                        </div>
                        <span className={styles.barValue}>
                          {value === undefined || value === null ? '—' : Math.round(value * 100)}
                          {delta !== null && delta !== 0 && (
                            <small className={delta > 0 ? local.up : local.down}> {delta > 0 ? `+${delta}` : delta}</small>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className={styles.notice}>{t('integration.dimensionsHint', 'Each branch is 0–100. They grow as you build ties, learn the language and get around the system — there is no "pass" or "fail".')}</p>
              </>
            ) : (
              <div className={styles.emptyState}>
                <i className="pi pi-map" />
                <p>{t('integration.empty', 'Take your first check-in to draw your map. It takes about two minutes.')}</p>
              </div>
            )}
            <div className={styles.actions}>
              {status.can_submit ? (
                <button type="button" className={styles.primaryButton} onClick={() => setTaking(true)}>
                  <i className="pi pi-play" /> {latest ? t('integration.retake', 'New check-in') : t('integration.start', 'Start')}
                </button>
              ) : (
                <span className={styles.muted}>
                  <i className="pi pi-clock" />{' '}
                  {t('integration.nextAt', { date: formatDate(status.next_available_at, i18n.language) })}
                </span>
              )}
            </div>
          </div>

          {history.length > 1 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><i className="pi pi-history" /> {t('integration.history', 'Earlier check-ins')}</h2>
              <ul className={styles.list}>
                {history.map((p: IntegrationPulse) => (
                  <li key={p.id} className={styles.listItem}>
                    <span className={styles.grow}>{formatDate(p.created_at, i18n.language)}</span>
                    <span className={styles.chips}>
                      {DIMENSIONS.filter((d) => p[d] !== undefined && p[d] !== null).map((d) => (
                        <span key={d} className={styles.chip} title={t(`integration.dimensions.${d}`)}>
                          <i className={DIMENSION_ICONS[d]} /> {Math.round((p[d] ?? 0) * 100)}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className={styles.notice}>
            {t('integration.source', 'Based on the IPL-12 integration index by the Immigration Policy Lab (Harder et al., PNAS 2018), adapted for Finland.')}{' '}
            <a href="https://immigrationlab.org/ipl-integration-index/" target="_blank" rel="noreferrer">immigrationlab.org</a>
          </p>
        </>
      )}
    </div>
  );
};

export default Integration;
