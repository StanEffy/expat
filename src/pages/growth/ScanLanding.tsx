import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerGrowthTranslations } from '@/i18n/registerGrowth';
import { networkService } from '@/services/growthService';
import type { CheckinResult, Person } from '@/types/growth';
import { AttendeePicker } from '@/components/Growth/AttendeePicker';
import { errorText } from '@/components/Growth/shared';
import styles from '@/components/Growth/Growth.module.scss';

registerGrowthTranslations();

interface Props {
  mode: 'connect' | 'checkin';
}

/** Where QR codes land: /connect/:code (someone's high five) and /checkin/:code (an event). */
export const ScanLanding: React.FC<Props> = ({ mode }) => {
  const { t } = useTranslation('growth');
  const { code = '' } = useParams<{ code: string }>();
  const [person, setPerson] = useState<Person | null>(null);
  const [checkin, setCheckin] = useState<CheckinResult | null>(null);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const started = useRef(false);

  useEffect(() => {
    registerGrowthTranslations();
    // StrictMode runs effects twice in development; the scan should only be sent once
    if (started.current) return;
    started.current = true;
    const run = mode === 'connect'
      ? networkService.connect(code).then(setPerson)
      : networkService.checkIn(code).then(setCheckin);
    run.catch((err) => setError(errorText(err, t('common.error', 'Something went wrong'))));
  }, [code, mode, t]);

  return (
    <div className={styles.container} data-reveal-children style={{ maxWidth: 620 }}>
      <div className={styles.card}>
        {error ? (
          <div className={styles.emptyState}>
            <i className="pi pi-exclamation-circle" />
            <p>{error}</p>
            <Link className={styles.secondaryButton} to="/network">{t('scan.toNetwork', 'Go to my connections')}</Link>
          </div>
        ) : person ? (
          <div className={styles.emptyState}>
            <i className="pi pi-check-circle" />
            <h2>{t('scan.highFive', { name: person.name })}</h2>
            <p>{t('scan.highFiveHint', 'You are now connected. You will find each other under My connections.')}</p>
            <Link className={styles.primaryButton} to="/network">{t('scan.toNetwork', 'Go to my connections')}</Link>
          </div>
        ) : checkin ? (
          <>
            <h2 className={styles.cardTitle}><i className="pi pi-check-circle" /> {t('scan.checkedIn', { title: checkin.event.title })}</h2>
            <p className={styles.cardSubtitle}>{checkin.event.date} · {checkin.event.location}</p>
            {savedMessage ? (
              <div className={styles.emptyState}>
                <p>{savedMessage}</p>
                <Link className={styles.primaryButton} to="/network">{t('scan.toNetwork', 'Go to my connections')}</Link>
              </div>
            ) : (
              <AttendeePicker
                eventId={checkin.event.id}
                attendees={checkin.attendees}
                onSaved={(n) => setSavedMessage(n > 0
                  ? t('network.newConnections', { count: n })
                  : t('network.marksSaved', 'Saved. You will be connected when they mark you too.'))}
              />
            )}
          </>
        ) : (
          <div className={styles.emptyState}><i className="pi pi-spin pi-spinner" /></div>
        )}
      </div>
    </div>
  );
};

export default ScanLanding;
