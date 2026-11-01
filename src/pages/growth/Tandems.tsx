import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { tandemsService } from '@/services/growthService';
import { useNotification } from '@/hooks/useNotification';
import { getUserId } from '@/utils/auth';
import type { CefrLevel, TandemCandidate, TandemProfile, TandemRequest, UserLanguage } from '@/types/growth';
import { CEFR_LEVELS, CITY_IDS, CITY_NAMES, COMMON_LANGUAGES, errorText, formatDate, languageName } from '@/components/Growth/shared';
import styles from '@/components/Growth/Growth.module.scss';

registerGrowthTranslations();

export const Tandems: React.FC = () => {
  const { t, i18n } = useTranslation('growth');
  const { showNotification } = useNotification();
  const lang = i18n.language;
  const me = getUserId();
  const [profile, setProfile] = useState<TandemProfile | null>(null);
  const [languages, setLanguages] = useState<UserLanguage[]>([]);
  const [visible, setVisible] = useState(false);
  const [city, setCity] = useState('');
  const [newLanguage, setNewLanguage] = useState('fi');
  const [suggestions, setSuggestions] = useState<TandemCandidate[]>([]);
  const [requests, setRequests] = useState<TandemRequest[]>([]);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(() => {
    tandemsService.profile().then((p) => {
      setProfile(p);
      setLanguages(p.languages);
      setVisible(p.settings.visible);
      setCity(p.settings.municipality_id ?? '');
      setDirty(false);
    }).catch(() => undefined);
    tandemsService.suggestions().then(setSuggestions).catch(() => undefined);
    tandemsService.requests().then(setRequests).catch(() => undefined);
  }, []);

  useEffect(() => {
    registerGrowthTranslations();
    load();
  }, [load]);

  const update = (index: number, patch: Partial<UserLanguage>) => {
    setLanguages((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    setDirty(true);
  };

  const addLanguage = () => {
    if (languages.some((l) => l.language === newLanguage)) return;
    setLanguages((prev) => [...prev, { language: newLanguage, level: 'A1', learning: true, can_help: false }]);
    setDirty(true);
  };

  const save = async () => {
    try {
      await tandemsService.saveProfile({ visible, municipality_id: city || undefined }, languages);
      showNotification(t('tandems.saved', 'Saved'), 'success');
      load();
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
    }
  };

  const act = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      showNotification(success, 'success');
      load();
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
    }
  };

  const levelLabel = (level: CefrLevel) => (level === 'native' ? t('tandems.native', 'Native') : level);
  const pending = requests.filter((r) => r.status === 'pending' && r.to_user_id === me);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t('tandems.title', 'Language tandems')}</h1>
        <p>{t('tandems.subtitle', 'Practise Finnish or Swedish with someone who speaks it — and help them with your language in return. Coffee, a walk, a call: you decide.')}</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}><i className="pi pi-language" /> {t('tandems.myLanguages', 'My languages')}</h2>
          <p className={styles.cardSubtitle}>{t('tandems.levelsHint', 'Levels follow the European CEFR scale: A1 beginner … C2 near-native. Update them as you grow; we keep the history.')}</p>
          <ul className={styles.list}>
            {languages.map((l, i) => (
              <li key={l.language} className={styles.listItem}>
                <div className={styles.grow}>
                  <div className={styles.itemTitle}>{languageName(l.language, lang)}</div>
                  <div className={styles.actions} style={{ marginTop: '0.4rem' }}>
                    <select
                      className={styles.input}
                      style={{ width: 'auto' }}
                      value={l.level}
                      onChange={(e) => update(i, { level: e.target.value as CefrLevel, learning: e.target.value === 'native' ? false : l.learning })}
                      aria-label={t('tandems.level', 'Level')}
                    >
                      {CEFR_LEVELS.map((lv) => <option key={lv} value={lv}>{levelLabel(lv)}</option>)}
                    </select>
                    {l.level !== 'native' && (
                      <label className={styles.checkbox}>
                        <input type="checkbox" checked={l.learning} onChange={(e) => update(i, { learning: e.target.checked })} />
                        <span>{t('tandems.learning', 'I am learning it')}</span>
                      </label>
                    )}
                    <label className={styles.checkbox}>
                      <input type="checkbox" checked={l.can_help} onChange={(e) => update(i, { can_help: e.target.checked })} />
                      <span>{t('tandems.canHelp', 'I can help others')}</span>
                    </label>
                  </div>
                </div>
                <button type="button" className={styles.dangerButton} aria-label={t('common.remove', 'Remove')} onClick={() => { setLanguages((prev) => prev.filter((_, j) => j !== i)); setDirty(true); }}>
                  <i className="pi pi-times" />
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.actions} style={{ marginTop: '0.9rem' }}>
            <select className={styles.input} style={{ width: 'auto' }} value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} aria-label={t('tandems.addLanguage', 'Add language')}>
              {COMMON_LANGUAGES.map((c) => <option key={c} value={c}>{languageName(c, lang)}</option>)}
            </select>
            <button type="button" className={styles.secondaryButton} onClick={addLanguage}><i className="pi pi-plus" /> {t('tandems.addLanguage', 'Add language')}</button>
          </div>
          <div className={styles.form} style={{ marginTop: '1.2rem' }}>
            <label className={styles.checkbox}>
              <input type="checkbox" checked={visible} onChange={(e) => { setVisible(e.target.checked); setDirty(true); }} />
              <span>{t('tandems.visible', 'Show me to people looking for a tandem partner')}</span>
            </label>
            <div className={styles.field}>
              <label htmlFor="tandem-city">{t('common.city', 'City')}</label>
              <select id="tandem-city" className={styles.input} value={city} onChange={(e) => { setCity(e.target.value); setDirty(true); }}>
                <option value="">{t('common.anyCity', 'Not specified')}</option>
                {CITY_IDS.map((c) => <option key={c} value={c}>{CITY_NAMES[c]}</option>)}
              </select>
            </div>
            <button type="button" className={styles.primaryButton} onClick={save} disabled={!dirty}>{t('common.save', 'Save')}</button>
          </div>
        </div>

        <div>
          {pending.length > 0 && (
            <div className={`${styles.card} ${styles.highlight}`}>
              <h2 className={styles.cardTitle}><i className="pi pi-inbox" /> {t('tandems.incoming', 'Requests for you')}</h2>
              <ul className={styles.list}>
                {pending.map((r) => (
                  <li key={r.id} className={styles.listItem}>
                    <div className={styles.grow}>
                      <div className={styles.itemTitle}>{r.from_name}</div>
                      <div className={styles.muted}>
                        {t('tandems.wantsToLearn', { language: languageName(r.learn_language, lang) })}
                        {r.offer_language && ` · ${t('tandems.offers', { language: languageName(r.offer_language, lang) })}`}
                      </div>
                      {r.message && <div className={styles.muted}>“{r.message}”</div>}
                    </div>
                    <div className={styles.actions}>
                      <button type="button" className={styles.primaryButton} onClick={() => act(() => tandemsService.accept(r.id), t('tandems.accepted', 'Tandem started! Find them under My connections.'))}>{t('network.accept', 'Accept')}</button>
                      <button type="button" className={styles.secondaryButton} onClick={() => act(() => tandemsService.decline(r.id), t('tandems.declinedMsg', 'Declined'))}>{t('network.decline', 'Decline')}</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.card}>
            <h2 className={styles.cardTitle}><i className="pi pi-users" /> {t('tandems.suggestions', 'Possible partners')}</h2>
            {suggestions.length === 0 ? (
              <p className={styles.muted}>{t('tandems.noSuggestions', 'Add a language you are learning to see people who can help. New partners appear as more people join.')}</p>
            ) : (
              <ul className={styles.list}>
                {suggestions.map((c) => (
                  <li key={`${c.user_id}-${c.they_help}`} className={styles.listItem}>
                    <div className={styles.grow}>
                      <div className={styles.itemTitle}>{c.name}</div>
                      <div className={styles.chips}>
                        <span className={styles.chip}>{t('tandems.helpsWith', { language: languageName(c.they_help, lang), level: levelLabel(c.their_level) })}</span>
                        {c.i_help && <span className={`${styles.chip} ${styles.chipGreen}`}>{t('tandems.mutual', { language: languageName(c.i_help, lang) })}</span>}
                        {c.same_city && c.municipality_id && <span className={`${styles.chip} ${styles.chipBlue}`}>{CITY_NAMES[c.municipality_id] ?? c.municipality_id}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => act(() => tandemsService.send(c.user_id, c.they_help, c.i_help, ''), t('tandems.sent', 'Request sent'))}
                    >
                      {t('tandems.ask', 'Ask for a tandem')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {profile && profile.history.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><i className="pi pi-chart-line" /> {t('tandems.progress', 'My progress')}</h2>
              <ul className={styles.list}>
                {profile.history.slice().reverse().slice(0, 12).map((h, i) => (
                  <li key={`${h.language}-${h.recorded_at}-${i}`} className={styles.listItem}>
                    <span className={styles.grow}>{languageName(h.language, lang)}</span>
                    <span className={styles.chip}>{levelLabel(h.level)}</span>
                    <span className={styles.muted}>{formatDate(h.recorded_at, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {requests.filter((r) => r.from_user_id === me).length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><i className="pi pi-send" /> {t('tandems.sentTitle', 'Sent requests')}</h2>
              <ul className={styles.list}>
                {requests.filter((r) => r.from_user_id === me).map((r) => (
                  <li key={r.id} className={styles.listItem}>
                    <span className={styles.grow}>{r.to_name} · {languageName(r.learn_language, lang)}</span>
                    <span className={r.status === 'accepted' ? `${styles.chip} ${styles.chipGreen}` : styles.chip}>{t(`network.introStatus.${r.status}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tandems;
