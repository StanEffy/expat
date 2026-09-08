import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import type { CommunityEvent } from '@/types/community';
import styles from './EventCard.module.scss';

interface Props {
  event: CommunityEvent & { isRegistered: boolean };
  onToggleRsvp: (id: string) => void;
}

export const EventCard: React.FC<Props> = ({ event, onToggleRsvp }) => {
  const { t } = useTranslation('community');

  const categoryLabel = t(`filters.event_categories.${event.category}`, event.category);

  return (
    <div className={`${styles.card} ${event.isRegistered ? styles.registered : ''}`}>
      <div>
        <div className={styles.topRow}>
          <Tag value={event.municipalityId.toUpperCase()} severity="info" />
          <Tag value={categoryLabel} severity="warning" />
          {event.price && <Tag value={event.price} severity="success" />}
        </div>

        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.desc}>{event.description}</p>

        <div className={styles.detailsList}>
          <div className={styles.detailRow}>
            <i className="pi pi-calendar" />
            <span>{event.date} • {event.time}</span>
          </div>
          <div className={styles.detailRow}>
            <i className="pi pi-map-marker" />
            <span>{event.location}</span>
          </div>
          <div className={styles.detailRow}>
            <i className="pi pi-users" />
            <span>{t('event.organizer', 'Organized by')}: {event.organizer}</span>
          </div>
          <div className={styles.detailRow}>
            <i className="pi pi-globe" />
            <span>{t('event.languages', 'Languages')}: {event.languages.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.attendeesInfo}>
          <i className="pi pi-user" />
          <span>
            {event.attendeesCount} {t('event.attendees', 'attending')}
            {event.maxAttendees ? ` / ${event.maxAttendees} max` : ''}
          </span>
        </div>

        <div className={styles.actions}>
          {event.isRegistered ? (
            <>
              <Tag value={t('event.attending_badge', "You're Going! ✓")} severity="success" />
              <Button
                icon="pi pi-times"
                tooltip={t('event.cancel_rsvp', 'Cancel RSVP')}
                severity="secondary"
                outlined
                size="small"
                onClick={() => onToggleRsvp(event.id)}
              />
            </>
          ) : (
            <Button
              label={t('event.rsvp_btn', 'RSVP / Join')}
              icon="pi pi-calendar-plus"
              size="small"
              onClick={() => onToggleRsvp(event.id)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
