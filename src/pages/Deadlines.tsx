import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/Common/SEO';
import { registerDeadlinesTranslations } from '@/i18n/registerDeadlines';
import {
  PLAN,
  RULES_CHECKED,
  SOURCES,
  buildIcs,
  buildTimeline,
  clearInput,
  daysBetween,
  EMPTY_INPUT,
  jobSearchCutByPermit,
  loadInput,
  parseDay,
  saveInput,
  today,
  toIso,
  type DeadlineInput,
  type PermitBasis,
  type TimelineItem,
} from '@/components/Deadlines/deadlines';
import styles from '@/components/Growth/Growth.module.scss';
import local from './Deadlines.module.scss';

registerDeadlinesTranslations();

const BASES: PermitBasis[] = ['work', 'studies', 'family', 'other'];

// Links inside the plan go to our own pages where we have one, otherwise to the official source
const PLAN_LINKS: Record<string, { to?: string; href?: string }> = {
  register: { href: SOURCES.jobMarket },
  benefits: { href: SOURCES.becomeUnemployed },
  checkPermit: { href: SOURCES.loseResidence },
  resume: { to: '/profile/resume-builder' },
  askNetwork: { to: '/network' },
  shortage: { href: SOURCES.shortageSectors },
  companies: { to: '/companies' },
  otherBasis: { href: SOURCES.loseResidence },
  advice: { href: SOURCES.becomeUnemployed },
  newSector: { href: SOURCES.unemployment },
  applyInTime: { href: SOURCES.extended },
};

/** "in 47 days", "in 5 months", "2 years ago" — calm, no countdown clock */
const relative = (days: number, lang: string) => {
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  const abs = Math.abs(days);
  if (abs < 45) return rtf.format(days, 'day');
  if (abs < 730) return rtf.format(Math.round(days / 30.44), 'month');
  return rtf.format(Math.round(days / 365.25), 'year');
};

const DatePlate: React.FC<{ date: Date; lang: string }> = ({ date, lang }) => (
  <div className={styles.dateBlock} aria-hidden="true">
    <span className={styles.dateWeekday}>{date.getFullYear()}</span>
    <span className={styles.dateDay}>{date.getDate()}</span>
    <span className={styles.dateMonth}>{date.toLocaleDateString(lang, { month: 'short' })}</span>
  </div>
);

export const Deadlines: React.FC = () => {
  const { t, i18n } = useTranslation('deadlines');
  const lang = i18n.language;
  const [input, setInput] = useState<DeadlineInput>(loadInput);
  const [jobOpen, setJobOpen] = useState(() => Boolean(loadInput().jobEnded));

  useEffect(() => {
    registerDeadlinesTranslations();
  }, []);

  useEffect(() => {
    saveInput(input);
  }, [input]);

  const update = <K extends keyof DeadlineInput>(key: K, value: DeadlineInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const timeline = useMemo(() => buildTimeline(input), [input]);
  const now = today();
  const upcoming = timeline.filter((item) => daysBetween(now, item.date) >= 0);
  const hasDates = Boolean(input.expiry || input.residenceStart);
  const showJob = input.basis === 'work';

  const itemText = (item: TimelineItem) =>
    t(`items.${item.id}.text`, {
      months: input.basis === 'work' ? 2 : 3,
      period: input.longProtection ? 6 : 3,
      years: input.hasLanguage ? 5 : 8,
      context: item.id === 'citizenship' && input.hasLanguage ? 'language' : undefined,
    });

  const downloadCalendar = () => {
    const ics = buildIcs(
      upcoming.map((item) => ({
        id: item.id,
        date: item.date,
        title: t(`items.${item.id}.title`),
        text: itemText(item),
        url: item.source,
      })),
    );
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-deadlines.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const forget = () => {
    clearInput();
    setInput(EMPTY_INPUT);
    setJobOpen(false);
  };

  const toggleStep = (id: string) =>
    update('done', input.done.includes(id) ? input.done.filter((d) => d !== id) : [...input.done, id]);

  const checked = parseDay(RULES_CHECKED);

  return (
    <>
      <SEO title={`${t('title')} - Expat`} description={t('subtitle')} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{t('title', 'My deadlines')}</h1>
          <p>{t('subtitle')}</p>
          <p className={local.privacy}>
            <i className="pi pi-lock" aria-hidden="true" /> {t('privacy')}
          </p>
        </div>

        <div className={local.layout}>
          <section className={styles.card} aria-labelledby="deadlines-form">
            <h2 id="deadlines-form" className={styles.cardTitle}>
              <i className="pi pi-pencil" aria-hidden="true" /> {t('form.title')}
            </h2>
            <p className={styles.cardSubtitle}>{t('form.hint')}</p>
            <div className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="dl-basis">{t('form.basis')}</label>
                <select
                  id="dl-basis"
                  className={styles.input}
                  value={input.basis}
                  onChange={(e) => update('basis', e.target.value as PermitBasis)}
                >
                  {BASES.map((b) => (
                    <option key={b} value={b}>{t(`form.bases.${b}`)}</option>
                  ))}
                </select>
              </div>

              <fieldset className={local.fieldset}>
                <legend className={styles.fieldLabel}>{t('form.kind')}</legend>
                <div className={local.segmented}>
                  {(['A', 'B'] as const).map((k) => (
                    <label key={k} className={`${local.segment} ${input.kind === k ? local.segmentOn : ''}`}>
                      <input
                        type="radio"
                        name="dl-kind"
                        value={k}
                        checked={input.kind === k}
                        onChange={() => update('kind', k)}
                      />
                      {t(`form.kinds.${k}`)}
                    </label>
                  ))}
                </div>
                <span className={styles.muted}>{t('form.kindHint')}</span>
              </fieldset>

              <div className={`${styles.formRow} ${local.datesRow}`}>
                <div className={styles.field}>
                  <label htmlFor="dl-expiry">{t('form.expiry')}</label>
                  <input
                    id="dl-expiry"
                    type="date"
                    className={styles.input}
                    value={input.expiry}
                    onChange={(e) => update('expiry', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="dl-start">{t('form.residenceStart')}</label>
                  <input
                    id="dl-start"
                    type="date"
                    className={styles.input}
                    value={input.residenceStart}
                    max={toIso(now)}
                    onChange={(e) => update('residenceStart', e.target.value)}
                    aria-describedby="dl-start-hint"
                  />
                </div>
              </div>
              <span id="dl-start-hint" className={styles.muted}>{t('form.residenceStartHint')}</span>

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={input.hasLanguage}
                  onChange={(e) => update('hasLanguage', e.target.checked)}
                />
                <span>{t('form.hasLanguage')}</span>
              </label>
            </div>
          </section>

          <section className={styles.card} aria-labelledby="deadlines-timeline">
            <h2 id="deadlines-timeline" className={styles.cardTitle}>
              <i className="pi pi-calendar" aria-hidden="true" /> {t('timeline.title')}
            </h2>
            {!hasDates && !input.jobEnded ? (
              <div className={styles.emptyState}>
                <i className="pi pi-calendar-plus" aria-hidden="true" />
                {t('timeline.empty')}
              </div>
            ) : (
              <>
                <ol className={`${styles.list} ${local.timeline}`}>
                  {timeline.map((item) => {
                    const left = daysBetween(now, item.date);
                    const past = left < 0;
                    // A milestone in the past is something you can already do; a limit in the past is over
                    const reached = past && !item.hard;
                    const chipClass = reached
                      ? styles.chipGreen
                      : past
                        ? ''
                        : item.hard
                          ? styles.chipOrange
                          : styles.chipBlue;
                    return (
                      <li key={item.id} className={`${styles.listItem} ${styles.meetupItem} ${past && !reached ? local.past : ''}`}>
                        <DatePlate date={item.date} lang={lang} />
                        <div className={styles.grow}>
                          <span className={styles.itemTitle}>{t(`items.${item.id}.title`)}</span>
                          <div className={styles.chips}>
                            <span className={`${styles.chip} ${chipClass}`}>
                              {reached ? t('timeline.reached') : past ? t('timeline.passed') : relative(left, lang)}
                            </span>
                            <span className={local.fullDate}>
                              {item.date.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <p className={`${styles.muted} ${local.itemText}`}>{itemText(item)}</p>
                          <a className={local.source} href={item.source} target="_blank" rel="noreferrer">
                            {t('timeline.source')} <i className="pi pi-external-link" aria-hidden="true" />
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {input.kind === 'B' && input.residenceStart && (
                  <p className={styles.notice}>{t('timeline.kindBNote')}</p>
                )}
                {jobSearchCutByPermit(input) && <p className={styles.notice}>{t('timeline.cutByPermit')}</p>}
                <div className={`${styles.actions} ${local.timelineActions}`}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={downloadCalendar}
                    disabled={upcoming.length === 0}
                  >
                    <i className="pi pi-bell" aria-hidden="true" /> {t('timeline.calendar')}
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={forget}>
                    <i className="pi pi-eraser" aria-hidden="true" /> {t('timeline.forget')}
                  </button>
                </div>
                <p className={styles.notice}>{t('timeline.calendarHint')}</p>
              </>
            )}
          </section>
        </div>

        {showJob && (
          <section className={`${styles.card} ${local.jobCard}`} aria-labelledby="deadlines-job">
            <h2 id="deadlines-job" className={styles.cardTitle}>
              <i className="pi pi-compass" aria-hidden="true" /> {t('job.title')}
            </h2>
            <p className={styles.cardSubtitle}>{t('job.hint')}</p>

            {!jobOpen ? (
              <button type="button" className={styles.secondaryButton} onClick={() => setJobOpen(true)}>
                {t('job.open')}
              </button>
            ) : (
              <>
                <div className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label htmlFor="dl-job-ended">{t('job.ended')}</label>
                      <input
                        id="dl-job-ended"
                        type="date"
                        className={styles.input}
                        value={input.jobEnded}
                        onChange={(e) => update('jobEnded', e.target.value)}
                      />
                    </div>
                  </div>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={input.longProtection}
                      onChange={(e) => update('longProtection', e.target.checked)}
                    />
                    <span>{t('job.longProtection')}</span>
                  </label>
                </div>

                <div className={local.plan}>
                  {PLAN.map((phase) => (
                    <div key={phase.phase} className={local.phase}>
                      <h3 className={local.phaseTitle}>{t(`plan.phases.${phase.phase}`)}</h3>
                      <ul className={local.steps}>
                        {phase.steps.map((step) => {
                          const link = PLAN_LINKS[step];
                          const done = input.done.includes(step);
                          return (
                            <li key={step} className={done ? local.stepDone : ''}>
                              <label className={styles.checkbox}>
                                <input type="checkbox" checked={done} onChange={() => toggleStep(step)} />
                                <span>
                                  <strong>{t(`plan.${step}.title`)}</strong> {t(`plan.${step}.text`)}
                                </span>
                              </label>
                              {link.to ? (
                                <Link className={local.stepLink} to={link.to}>
                                  {t(`plan.${step}.link`)} <i className="pi pi-arrow-right" aria-hidden="true" />
                                </Link>
                              ) : (
                                <a className={local.stepLink} href={link.href} target="_blank" rel="noreferrer">
                                  {t(`plan.${step}.link`)} <i className="pi pi-external-link" aria-hidden="true" />
                                </a>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className={styles.notice}>{t('job.calm')}</p>
              </>
            )}
          </section>
        )}

        <p className={`${styles.notice} ${local.disclaimer}`}>
          {t('disclaimer', {
            date: checked ? checked.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' }) : RULES_CHECKED,
          })}
        </p>
      </div>
    </>
  );
};

export default Deadlines;
