import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { settlingService } from '@/services/growthService';
import { isTokenValid } from '@/utils/auth';
import styles from './Growth.module.scss';

registerGrowthTranslations();

interface Props {
  municipalityId?: string;
}

/**
 * Optional "when did you arrive" for logged-in users. With it, the checklist dates show how
 * long each step takes after arrival, which cities see as anonymous medians (with consent).
 */
export const SettlingCard: React.FC<Props> = ({ municipalityId }) => {
  const { t } = useTranslation('growth');
  const [arrival, setArrival] = useState('');
  const [share, setShare] = useState(false);
  const [saved, setSaved] = useState<'idle' | 'saved' | 'error'>('idle');
  const loggedIn = isTokenValid();

  useEffect(() => {
    if (!loggedIn) return;
    settlingService.get().then((s) => {
      setArrival(s.profile.arrival_month ?? '');
      setShare(s.profile.share_for_statistics);
    }).catch(() => undefined);
  }, [loggedIn]);

  if (!loggedIn) return null;

  const save = async (nextArrival: string, nextShare: boolean) => {
    try {
      await settlingService.saveProfile({
        arrival_month: nextArrival || undefined,
        municipality_id: municipalityId && municipalityId !== 'other' ? municipalityId : undefined,
        share_for_statistics: nextShare,
      });
      setSaved('saved');
    } catch {
      setSaved('error');
    }
  };

  const thisMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
      <h2 className={styles.cardTitle}><i className="pi pi-stopwatch" /> {t('settling.title', 'How long does settling in take?')}</h2>
      <p className={styles.cardSubtitle}>{t('settling.hint', 'Optional. Tell us roughly when you arrived — then the dates you tick steps off show how long each one took, and your city can see where newcomers get stuck.')}</p>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label htmlFor="arrival-month">{t('settling.arrival', 'Arrived in Finland (month)')}</label>
          <input
            id="arrival-month"
            type="month"
            max={thisMonth}
            className={styles.input}
            value={arrival}
            onChange={(e) => {
              setArrival(e.target.value);
              void save(e.target.value, share);
            }}
          />
        </div>
        <label className={styles.checkbox} style={{ alignSelf: 'end' }}>
          <input
            type="checkbox"
            checked={share}
            onChange={(e) => {
              setShare(e.target.checked);
              void save(arrival, e.target.checked);
            }}
          />
          <span>{t('settling.consent', 'Count my dates in anonymous city statistics (groups of 10+ only)')}</span>
        </label>
      </div>
      {saved === 'saved' && <p className={styles.notice}>{t('settling.saved', 'Saved')}</p>}
      {saved === 'error' && <p className={styles.error}>{t('common.error', 'Something went wrong')}</p>}
    </div>
  );
};

export default SettlingCard;
