import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { passportService } from '@/services/growthService';
import { useNotification } from '@/hooks/useNotification';
import type { Passport as PassportData } from '@/types/growth';
import { errorText, formatDate, languageName } from '@/components/Growth/shared';
import styles from '@/components/Growth/Growth.module.scss';

registerGrowthTranslations();

const PassportView: React.FC<{ passport: PassportData; own: boolean }> = ({ passport, own }) => {
  const { t, i18n } = useTranslation('growth');
  const lang = i18n.language;
  const nothing = passport.connections === 0 && passport.events.length === 0 && passport.languages.length === 0 &&
    passport.hours_given === 0 && passport.challenges.length === 0 && passport.ventures.length === 0;

  return (
    <>
      <div className={styles.stats}>
        <div className={styles.stat}><div className={styles.statValue}>{passport.connections}</div><div className={styles.statLabel}>{t('passport.connections', 'People met')}</div></div>
        <div className={styles.stat}><div className={styles.statValue}>{passport.events.length}</div><div className={styles.statLabel}>{t('passport.events', 'Events attended')}</div></div>
        <div className={styles.stat}><div className={styles.statValue}>{passport.hours_given}</div><div className={styles.statLabel}>{t('passport.hoursGiven', 'Hours helping others')}</div></div>
        <div className={styles.stat}><div className={styles.statValue}>{passport.endorsements.reduce((n, e) => n + e.count, 0)}</div><div className={styles.statLabel}>{t('passport.endorsementsCount', 'Skill endorsements')}</div></div>
      </div>

      {nothing && (
        <div className={`${styles.card} ${styles.emptyState} ${styles.section}`}>
          <i className="pi pi-id-card" />
          {own
            ? t('passport.emptyOwn', 'Your passport fills up as you take part: check in at events, join a tandem, help in the time bank, team up in a city challenge.')
            : t('passport.emptyPublic', 'Nothing here yet.')}
        </div>
      )}

      <div className={`${styles.grid} ${styles.section}`}>
        {passport.endorsements.length > 0 && (
          <div className={styles.card} style={{ marginTop: 0 }}>
            <h2 className={styles.cardTitle}><i className="pi pi-thumbs-up" /> {t('passport.endorsements', 'Skills vouched for by people they met')}</h2>
            <ul className={styles.list} data-reveal-children>
              {passport.endorsements.map((e) => (
                <li key={e.skill} className={styles.listItem}>
                  <span className={`${styles.grow} ${styles.itemTitle}`}>{e.skill}</span>
                  <span className={styles.chip}>×{e.count}</span>
                  <span className={styles.muted}>{e.endorsers.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {passport.languages.length > 0 && (
          <div className={styles.card} style={{ marginTop: 0 }}>
            <h2 className={styles.cardTitle}><i className="pi pi-language" /> {t('passport.languages', 'Languages')}</h2>
            <ul className={styles.list} data-reveal-children>
              {passport.languages.map((l) => (
                <li key={l.language} className={styles.listItem}>
                  <span className={styles.grow}>{languageName(l.language, lang)}</span>
                  {l.first_level !== l.level && l.first_level !== 'native' && (
                    <span className={`${styles.chip} ${styles.chipGreen}`}>{l.first_level} → {l.level}</span>
                  )}
                  {l.first_level === l.level && <span className={styles.chip}>{l.level === 'native' ? t('tandems.native', 'Native') : l.level}</span>}
                </li>
              ))}
            </ul>
            {passport.tandems > 0 && <p className={styles.notice}>{t('passport.tandems', { count: passport.tandems })}</p>}
          </div>
        )}

        {passport.hours_given > 0 && (
          <div className={styles.card} style={{ marginTop: 0 }}>
            <h2 className={styles.cardTitle}><i className="pi pi-clock" /> {t('passport.helped', 'Helped others with')}</h2>
            <ul className={styles.list} data-reveal-children>
              {passport.helped_with.map((h) => (
                <li key={h.category} className={styles.listItem}>
                  <span className={styles.grow}>{t(`timebank.categories.${h.category}`)}</span>
                  <span className={styles.chip}>{t('passport.hours', { count: h.hours })}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {passport.challenges.length > 0 && (
          <div className={styles.card} style={{ marginTop: 0 }}>
            <h2 className={styles.cardTitle}><i className="pi pi-flag" /> {t('passport.challenges', 'City challenges')}</h2>
            <ul className={styles.list} data-reveal-children>
              {passport.challenges.map((c, i) => (
                <li key={`${c.challenge}-${i}`} className={styles.listItem}>
                  <div className={styles.grow}>
                    <div className={styles.itemTitle}>{c.challenge}</div>
                    <div className={styles.muted}>{t('passport.team', { team: c.team })}</div>
                  </div>
                  {c.promoted ? (
                    <span className={`${styles.chip} ${styles.chipGreen}`}>{t('challenges.inBudget', 'In budget voting')}</span>
                  ) : c.submitted ? (
                    <span className={styles.chip}>{t('passport.submitted', 'Idea submitted')}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        )}

        {passport.ventures.length > 0 && (
          <div className={styles.card} style={{ marginTop: 0 }}>
            <h2 className={styles.cardTitle}><i className="pi pi-briefcase" /> {t('passport.ventures', 'Companies (verified in the Trade Register)')}</h2>
            <ul className={styles.list} data-reveal-children>
              {passport.ventures.map((v) => (
                <li key={v.business_id} className={styles.listItem}>
                  <div className={styles.grow}>
                    <div className={styles.itemTitle}>{v.name}</div>
                    <div className={styles.muted}>{v.business_id}{v.city && ` · ${v.city}`}{v.registration_date && ` · ${formatDate(v.registration_date, lang)}`}</div>
                  </div>
                  <span className={v.is_active ? `${styles.chip} ${styles.chipGreen}` : `${styles.chip} ${styles.chipOrange}`}>
                    {v.is_active ? t('ventures.active', 'Active') : t('ventures.inactive', 'Not active')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {passport.events.length > 0 && (
          <div className={styles.card} style={{ marginTop: 0 }}>
            <h2 className={styles.cardTitle}><i className="pi pi-calendar" /> {t('passport.eventsTitle', 'Events')}</h2>
            <ul className={styles.list} data-reveal-children>
              {passport.events.slice(0, 12).map((e, i) => (
                <li key={`${e.title}-${i}`} className={styles.listItem}>
                  <span className={styles.grow}>{e.title}</span>
                  <span className={styles.muted}>{e.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <p className={styles.notice}>{t('passport.verified', 'Everything here was recorded on EXPAT and confirmed by other people or official registers — nothing is self-declared.')}</p>
    </>
  );
};

export const Passport: React.FC = () => {
  const { t } = useTranslation('growth');
  const { showNotification } = useNotification();
  const [passport, setPassport] = useState<PassportData | null>(null);

  useEffect(() => {
    registerGrowthTranslations();
    passportService.get().then(setPassport).catch(() => undefined);
  }, []);

  const shareUrl = passport?.public_token ? `${window.location.origin}/p/${passport.public_token}` : '';

  const toggleShare = async () => {
    if (!passport) return;
    try {
      const result = await passportService.setPublic(!passport.public);
      setPassport({ ...passport, public: result.public, public_token: result.public_token });
    } catch (err) {
      showNotification(errorText(err, t('common.error', 'Something went wrong')), 'error');
    }
  };

  if (!passport) return null;

  return (
    <div className={styles.container} data-reveal-children>
      <div className={styles.header}>
        <h1>{t('passport.title', 'Skills passport')}</h1>
        <p>{t('passport.subtitle', 'Proof of what you have done in Finland, confirmed by the people you did it with. Share it with a future co-founder, employer or a grant program.')}</p>
      </div>

      <div className={`${styles.card} ${passport.public ? styles.highlight : ''}`}>
        <h2 className={styles.cardTitle}><i className={passport.public ? 'pi pi-globe' : 'pi pi-lock'} /> {passport.public ? t('passport.isPublic', 'Shared by link') : t('passport.isPrivate', 'Private')}</h2>
        <p className={styles.cardSubtitle}>{t('passport.shareHint', 'Only people with the link can see it. Turning sharing off makes old links stop working.')}</p>
        <div className={styles.actions}>
          <button type="button" className={passport.public ? styles.secondaryButton : styles.primaryButton} onClick={toggleShare}>
            {passport.public ? t('passport.stopSharing', 'Stop sharing') : t('passport.share', 'Create share link')}
          </button>
          {shareUrl && (
            <>
              <input className={styles.input} style={{ flex: 1, minWidth: '14rem' }} readOnly value={shareUrl} aria-label={t('passport.link', 'Share link')} onFocus={(e) => e.target.select()} />
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  void navigator.clipboard?.writeText(shareUrl);
                  showNotification(t('passport.copied', 'Link copied'), 'success');
                }}
              >
                <i className="pi pi-copy" /> {t('passport.copy', 'Copy')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <PassportView passport={passport} own />
      </div>
    </div>
  );
};

export const PublicPassport: React.FC = () => {
  const { t } = useTranslation('growth');
  const { token = '' } = useParams<{ token: string }>();
  const [passport, setPassport] = useState<PassportData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    registerGrowthTranslations();
    passportService.getPublic(token).then(setPassport).catch(() => setMissing(true));
  }, [token]);

  if (missing) {
    return (
      <div className={styles.container} data-reveal-children>
        <div className={`${styles.card} ${styles.emptyState}`}>
          <i className="pi pi-lock" />
          {t('passport.notFound', 'This passport is not shared, or the link has been turned off.')}
        </div>
      </div>
    );
  }
  if (!passport) return null;

  return (
    <div className={styles.container} data-reveal-children>
      <div className={styles.header}>
        <h1>{t('passport.publicTitle', { name: passport.name })}</h1>
        <p>{t('passport.publicSubtitle', 'Verified activity on EXPAT, the platform for people building their life in Finland.')}</p>
      </div>
      <PassportView passport={passport} own={false} />
      <div className={styles.actions} style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
        <Link to="/" className={styles.secondaryButton}>{t('passport.aboutExpat', 'What is EXPAT?')}</Link>
      </div>
    </div>
  );
};

export default Passport;
