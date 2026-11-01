import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { networkService } from '@/services/growthService';
import type { EventAttendee } from '@/types/growth';
import { errorText } from './shared';
import styles from './Growth.module.scss';

interface Props {
  eventId: number;
  attendees: EventAttendee[];
  /** Called with the number of new mutual connections */
  onSaved: (newConnections: number) => void;
}

/** "Who did you talk to?" — a connection appears once both people mark each other. */
export const AttendeePicker: React.FC<Props> = ({ eventId, attendees, onSaved }) => {
  const { t } = useTranslation('growth');
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(attendees.filter((a) => a.marked_by_me).map((a) => a.user_id)),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    const fresh = [...selected].filter((id) => !attendees.find((a) => a.user_id === id)?.marked_by_me);
    if (fresh.length === 0) {
      onSaved(0);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await networkService.markMet(eventId, fresh);
      onSaved(result.new_connections);
    } catch (err) {
      setError(errorText(err, t('common.error', 'Something went wrong')));
    } finally {
      setSaving(false);
    }
  };

  if (attendees.length === 0) {
    return <p className={styles.muted}>{t('network.noAttendees', 'Nobody else has checked in yet. Come back later to mark who you talked to.')}</p>;
  }

  return (
    <div>
      <p className={styles.muted}>{t('network.whoDidYouMeet', 'Who did you talk to? You get connected when they mark you too.')}</p>
      <ul className={styles.list} style={{ margin: '0.75rem 0' }}>
        {attendees.map((a) => (
          <li key={a.user_id}>
            <label className={`${styles.listItem} ${styles.checkbox}`} style={{ flexDirection: 'row' }}>
              <input
                type="checkbox"
                checked={a.connected || selected.has(a.user_id)}
                disabled={a.connected || a.marked_by_me}
                onChange={() => toggle(a.user_id)}
              />
              <span className={styles.grow}>{a.name}</span>
              {a.connected && <span className={`${styles.chip} ${styles.chipGreen}`}>{t('network.alreadyConnected', 'Connected')}</span>}
              {!a.connected && a.marked_by_me && <span className={styles.chip}>{t('network.waiting', 'Waiting for them')}</span>}
            </label>
          </li>
        ))}
      </ul>
      {error && <p className={styles.error}>{error}</p>}
      <button type="button" className={styles.primaryButton} onClick={save} disabled={saving}>
        {saving ? <i className="pi pi-spin pi-spinner" /> : t('network.saveMet', 'Save')}
      </button>
    </div>
  );
};

export default AttendeePicker;
