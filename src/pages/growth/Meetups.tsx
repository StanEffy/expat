import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { meetupsService } from '@/services/growthService';
import { useNotification } from '@/hooks/useNotification';
import type { CreateMeetupPayload, MeetupFormat, MeetupRecurrence, OpenMeetup } from '@/types/growth';
import { CITY_IDS, CITY_NAMES, errorText, languageName } from '@/components/Growth/shared';
import { LanguagePicker } from '@/components/Growth/LanguagePicker';
import styles from '@/components/Growth/Growth.module.scss';

registerGrowthTranslations();

const MAX_LANGUAGES = 3;
const RECURRENCES: MeetupRecurrence[] = ['weekly', 'biweekly', 'once'];

/** Today's date in Helsinki as YYYY-MM-DD, for the date picker's lower bound */
const helsinkiToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Helsinki' }).format(new Date());

const emptyForm = (): CreateMeetupPayload => ({
  title: '',
  description: '',
  languages: [],
  format: 'in_person',
  location: '',
  municipality_id: 'helsinki',
  recurrence: 'weekly',
  start_date: helsinkiToday(),
  start_time: '18:00',
  end_time: '20:00',
});

const isWebLink = (value: string) => /^https?:\/\//i.test(value);

const DateBlock: React.FC<{ date: string; lang: string }> = ({ date, lang }) => {
  const d = new Date(`${date}T12:00:00`);
  return (
    <div className={styles.dateBlock} aria-hidden="true">
      <span className={styles.dateWeekday}>{d.toLocaleDateString(lang, { weekday: 'short' })}</span>
      <span className={styles.dateDay}>{d.getDate()}</span>
      <span className={styles.dateMonth}>{d.toLocaleDateString(lang, { month: 'short' })}</span>
    </div>
  );
};

/** Open meetups that residents organise themselves: speaking clubs, regular calls, walks. */
export const Meetups: React.FC = () => {
  const { t, i18n } = useTranslation('growth');
  const lang = i18n.language;
  const { showNotification } = useNotification();
  const [meetups, setMeetups] = useState<OpenMeetup[] | null>(null);
  const [language, setLanguage] = useState('');
  const [city, setCity] = useState('');
  const [format, setFormat] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateMeetupPayload>(emptyForm);
  const [capacity, setCapacity] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    meetupsService.list(language, city, format).then(setMeetups).catch(() => setMeetups([]));
  }, [language, city, format]);

  useEffect(() => {
    registerGrowthTranslations();
    load();
  }, [load]);

  const act = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      showNotification(success, 'success');
      load();
      return true;
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
      return false;
    }
  };

  const setField = <K extends keyof CreateMeetupPayload>(key: K, value: CreateMeetupPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.end_time <= form.start_time) {
      showNotification(t('meetups.endAfterStart', 'The meetup has to end after it starts.'), 'error');
      return;
    }
    setSaving(true);
    const payload: CreateMeetupPayload = {
      ...form,
      municipality_id: form.municipality_id || undefined,
      capacity: capacity ? Number(capacity) : undefined,
    };
    const ok = await act(() => meetupsService.create(payload), t('meetups.created', 'Published. You are on the list as the organizer.'));
    setSaving(false);
    if (ok) {
      setForm(emptyForm());
      setCapacity('');
      setShowForm(false);
    }
  };

  const cancelMeetup = (m: OpenMeetup) => {
    if (!window.confirm(t('meetups.cancelConfirm', 'Cancel this meetup for everyone? It disappears from the list.'))) return;
    act(() => meetupsService.cancel(m.id), t('meetups.cancelled', 'Meetup cancelled'));
  };

  const scheduleText = (m: OpenMeetup) => {
    const next = new Date(`${m.next_date}T12:00:00`).toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' });
    const time = `${m.start_time}–${m.end_time}`;
    if (m.recurrence === 'once') return `${next.charAt(0).toLocaleUpperCase(lang)}${next.slice(1)}, ${time}`;
    return `${t(`meetups.recurrence.${m.recurrence}`)} · ${t('meetups.next', 'next')}: ${next}, ${time}`;
  };

  const visible = (meetups ?? []).filter((m) => !onlyMine || m.joined || m.is_organizer);

  return (
    <div className={styles.container} data-reveal-children>
      <div className={styles.header}>
        <h1>{t('meetups.title', 'Open meetups')}</h1>
        <p>{t('meetups.subtitle', 'Meetups that members run themselves: a Saturday speaking club, a call every other week, a walk. Start your own or just show up.')}</p>
      </div>

      <div className={styles.card}>
        <div className={styles.actions} style={{ justifyContent: 'space-between' }}>
          <h2 className={styles.cardTitle} style={{ margin: 0 }}><i className="pi pi-plus-circle" /> {t('meetups.organize', 'Organize a meetup')}</h2>
          <button type="button" className={showForm ? styles.secondaryButton : styles.primaryButton} onClick={() => setShowForm((v) => !v)} aria-expanded={showForm}>
            {showForm ? t('meetups.closeForm', 'Close') : t('meetups.openForm', 'New meetup')}
          </button>
        </div>
        {!showForm && <p className={styles.cardSubtitle} style={{ margin: '0.6rem 0 0' }}>{t('meetups.organizeHint', 'Pick a time and a place or a call link. It is your meetup, not an event by the platform: you decide the format.')}</p>}

        {showForm && (
          <form className={styles.form} style={{ marginTop: '1rem' }} onSubmit={create}>
            <div className={styles.field}>
              <label htmlFor="meetup-title">{t('meetups.fields.title', 'Name')}</label>
              <input id="meetup-title" className={styles.input} required minLength={3} maxLength={120} value={form.title}
                placeholder={t('meetups.fields.titlePlaceholder', 'Finnish speaking club at the library')}
                onChange={(e) => setField('title', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="meetup-description">{t('meetups.fields.description', 'What happens there')}</label>
              <textarea id="meetup-description" className={styles.input} maxLength={2000} value={form.description}
                placeholder={t('meetups.fields.descriptionPlaceholder', 'Who it is for, what level, what to bring')}
                onChange={(e) => setField('description', e.target.value)} />
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t('meetups.fields.languages', 'Languages spoken (optional, up to 3)')}</span>
              {form.languages.length > 0 && (
                <div className={styles.chips} style={{ marginTop: 0 }}>
                  {form.languages.map((code) => (
                    <button key={code} type="button" className={styles.chip} onClick={() => setField('languages', form.languages.filter((l) => l !== code))}
                      aria-label={`${t('common.remove', 'Remove')}: ${languageName(code, lang)}`}>
                      {languageName(code, lang)} ×
                    </button>
                  ))}
                </div>
              )}
              {form.languages.length < MAX_LANGUAGES && (
                <LanguagePicker
                  value=""
                  onChange={(code) => code && setField('languages', [...form.languages, code])}
                  exclude={form.languages}
                  ariaLabel={t('meetups.fields.languages', 'Languages spoken (optional, up to 3)')}
                  placeholder={`+ ${t('meetups.fields.addLanguage', 'Add a language')}`}
                />
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="meetup-format">{t('meetups.fields.format', 'Format')}</label>
                <select id="meetup-format" className={styles.input} value={form.format} onChange={(e) => setField('format', e.target.value as MeetupFormat)}>
                  <option value="in_person">{t('meetups.format.in_person', 'In person')}</option>
                  <option value="online">{t('meetups.format.online', 'Online call')}</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="meetup-city">{t('common.city', 'City')}</label>
                <select id="meetup-city" className={styles.input} value={form.municipality_id ?? ''} required={form.format === 'in_person'}
                  onChange={(e) => setField('municipality_id', e.target.value)}>
                  {form.format === 'online' && <option value="">{t('meetups.anyCity', 'Any city')}</option>}
                  {CITY_IDS.map((c) => <option key={c} value={c}>{CITY_NAMES[c]}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="meetup-location">
                {form.format === 'online' ? t('meetups.fields.link', 'Call link') : t('meetups.fields.place', 'Place')}
              </label>
              <input id="meetup-location" className={styles.input} required maxLength={300} value={form.location}
                type={form.format === 'online' ? 'url' : 'text'}
                placeholder={form.format === 'online' ? 'https://' : t('meetups.fields.placePlaceholder', 'Oodi, 2nd floor, café corner')}
                onChange={(e) => setField('location', e.target.value)} />
              {form.format === 'online' && <span className={styles.muted}>{t('meetups.linkPrivate', 'Only people who sign up see the link.')}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="meetup-recurrence">{t('meetups.fields.recurrence', 'How often')}</label>
                <select id="meetup-recurrence" className={styles.input} value={form.recurrence} onChange={(e) => setField('recurrence', e.target.value as MeetupRecurrence)}>
                  {RECURRENCES.map((r) => <option key={r} value={r}>{t(`meetups.recurrence.${r}`)}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="meetup-date">{form.recurrence === 'once' ? t('meetups.fields.date', 'Date') : t('meetups.fields.firstDate', 'First date')}</label>
                <input id="meetup-date" className={styles.input} type="date" required min={helsinkiToday()} value={form.start_date}
                  onChange={(e) => setField('start_date', e.target.value)} />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="meetup-start">{t('meetups.fields.from', 'From')}</label>
                <input id="meetup-start" className={styles.input} type="time" required value={form.start_time} onChange={(e) => setField('start_time', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label htmlFor="meetup-end">{t('meetups.fields.to', 'To')}</label>
                <input id="meetup-end" className={styles.input} type="time" required value={form.end_time} onChange={(e) => setField('end_time', e.target.value)} />
              </div>
            </div>
            <span className={styles.muted}>{t('meetups.timezone', 'Times are Finnish time. Repeating meetups happen on the same weekday as the first date.')}</span>

            <div className={styles.field} style={{ maxWidth: '16rem' }}>
              <label htmlFor="meetup-capacity">{t('meetups.fields.capacity', 'Max people (optional)')}</label>
              <input id="meetup-capacity" className={styles.input} type="number" min={2} max={500} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.primaryButton} disabled={saving}>{t('meetups.publish', 'Publish')}</button>
            </div>
          </form>
        )}
      </div>

      <div className={`${styles.card} ${styles.section}`}>
        <h2 className={styles.cardTitle}><i className="pi pi-calendar" /> {t('meetups.upcoming', 'Upcoming')}</h2>
        <div className={styles.actions} style={{ marginBottom: '1rem' }}>
          <LanguagePicker value={language} onChange={setLanguage} ariaLabel={t('meetups.filterLanguage', 'Language')} anyLabel={t('meetups.anyLanguage', 'Any language')} />
          <select className={`${styles.input} ${styles.inputCompact}`} style={{ minHeight: 40 }} value={city} onChange={(e) => setCity(e.target.value)} aria-label={t('common.city', 'City')}>
            <option value="">{t('common.allCities', 'All cities')}</option>
            {CITY_IDS.map((c) => <option key={c} value={c}>{CITY_NAMES[c]}</option>)}
          </select>
          <select className={`${styles.input} ${styles.inputCompact}`} style={{ minHeight: 40 }} value={format} onChange={(e) => setFormat(e.target.value)} aria-label={t('meetups.fields.format', 'Format')}>
            <option value="">{t('meetups.anyFormat', 'Online and in person')}</option>
            <option value="in_person">{t('meetups.format.in_person', 'In person')}</option>
            <option value="online">{t('meetups.format.online', 'Online call')}</option>
          </select>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
            <span>{t('meetups.onlyMine', 'Only mine')}</span>
          </label>
        </div>

        {meetups === null ? null : visible.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="pi pi-calendar-plus" aria-hidden="true" />
            {t('meetups.empty', 'No meetups here yet. Start one: a regular slot is often all it takes.')}
          </div>
        ) : (
          <ul className={styles.list} data-reveal-children>
            {visible.map((m) => {
              const full = m.capacity !== undefined && m.capacity !== null && m.member_count >= m.capacity;
              return (
                <li key={m.id} className={`${styles.listItem} ${styles.meetupItem}`}>
                  <DateBlock date={m.next_date} lang={lang} />
                  <div className={styles.grow}>
                    <div className={styles.itemTitle}>{m.title}</div>
                    <div className={styles.metaLine}>
                      <span><i className="pi pi-clock" aria-hidden="true" />{scheduleText(m)}</span>
                    </div>
                    <div className={styles.chips}>
                      <span className={`${styles.chip} ${m.format === 'online' ? styles.chipBlue : styles.chipGreen}`}>{t(`meetups.format.${m.format}`)}</span>
                      {m.municipality_id && <span className={styles.chip}>{CITY_NAMES[m.municipality_id] ?? m.municipality_id}</span>}
                      {m.languages.map((code) => <span key={code} className={styles.chip}>{languageName(code, lang)}</span>)}
                    </div>
                    {m.description && <p className={styles.muted} style={{ margin: '0.5rem 0 0', whiteSpace: 'pre-line' }}>{m.description}</p>}
                    <div className={styles.metaLine}>
                      <span>
                        <i className={m.format === 'online' ? 'pi pi-video' : 'pi pi-map-marker'} aria-hidden="true" />
                        {m.location_hidden ? (
                          t('meetups.linkAfterJoin', 'Link appears after you sign up')
                        ) : isWebLink(m.location) ? (
                          <a className={styles.meetupLink} href={m.location} target="_blank" rel="noopener noreferrer nofollow">{m.location}</a>
                        ) : (
                          <span className={styles.meetupLink}>{m.location}</span>
                        )}
                      </span>
                      <span><i className="pi pi-user" aria-hidden="true" />{t('meetups.organizer', { name: m.organizer_name, defaultValue: 'Organizer: {{name}}' })}</span>
                      <span>
                        <i className="pi pi-users" aria-hidden="true" />
                        {m.capacity
                          ? t('meetups.membersOf', { count: m.member_count, capacity: m.capacity, defaultValue: '{{count}} of {{capacity}} coming' })
                          : t('meetups.members', { count: m.member_count, defaultValue: '{{count}} coming' })}
                      </span>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    {m.is_organizer ? (
                      <button type="button" className={styles.dangerButton} onClick={() => cancelMeetup(m)}>{t('meetups.cancel', 'Cancel meetup')}</button>
                    ) : m.joined ? (
                      <button type="button" className={styles.secondaryButton} onClick={() => act(() => meetupsService.leave(m.id), t('meetups.left', 'You are off the list'))}>
                        {t('meetups.leave', 'I can’t come')}
                      </button>
                    ) : (
                      <button type="button" className={styles.primaryButton} disabled={full} onClick={() => act(() => meetupsService.join(m.id), t('meetups.joined', 'You are on the list. See you there!'))}>
                        {full ? t('meetups.full', 'Full') : t('meetups.join', 'I’ll come')}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Meetups;
