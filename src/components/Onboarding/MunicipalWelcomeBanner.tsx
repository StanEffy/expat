import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MunicipalityId } from '@/types/onboarding';
import { MUNICIPAL_HUBS } from '@/constants/onboardingData';
import styles from './MunicipalWelcomeBanner.module.scss';

interface Props {
  municipalityId: MunicipalityId;
}

export const MunicipalWelcomeBanner: React.FC<Props> = ({ municipalityId }) => {
  const { t } = useTranslation('onboarding');
  const hub = MUNICIPAL_HUBS[municipalityId] || MUNICIPAL_HUBS.other;

  return (
    <div className={styles.banner}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <i className="pi pi-building-columns" />
          <div>
            <h2>{hub.name}</h2>
            <p className={styles.hubName}>{hub.hubName}</p>
          </div>
        </div>
        <span className={styles.badgeCity}>
          <i className="pi pi-map-marker" style={{ marginRight: '0.35rem' }} />
          {hub.name}
        </span>
      </div>

      <p className={styles.description}>{t(hub.descriptionKey)}</p>

      {(hub.address || hub.email || hub.phone) && (
        <div className={styles.detailsGrid}>
          {hub.address && (
            <div className={styles.detailItem}>
              <i className="pi pi-map" />
              <span>{hub.address}</span>
            </div>
          )}
          {hub.email && (
            <div className={styles.detailItem}>
              <i className="pi pi-envelope" />
              <span>{hub.email}</span>
            </div>
          )}
          {hub.phone && (
            <div className={styles.detailItem}>
              <i className="pi pi-phone" />
              <span>{hub.phone}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.actions}>
        {hub.serviceBookingUrl && (
          <a
            href={hub.serviceBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.actionBtn} ${styles.primary}`}
          >
            <i className="pi pi-calendar-plus" />
            {t('checklist.view_hub_info')}
          </a>
        )}
        <a
          href={hub.website}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.actionBtn} ${styles.secondary}`}
        >
          <i className="pi pi-external-link" />
          {hub.name} Official Portal
        </a>
      </div>
    </div>
  );
};

export default MunicipalWelcomeBanner;
