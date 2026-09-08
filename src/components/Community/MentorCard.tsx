import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import type { MentorProfile } from '@/types/community';
import styles from './MentorCard.module.scss';

interface Props {
  mentor: MentorProfile;
}

export const MentorCard: React.FC<Props> = ({ mentor }) => {
  const { t } = useTranslation('community');

  const initials = mentor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  const handleContact = () => {
    window.location.href = `mailto:${mentor.contactEmail}?subject=Mentorship inquiry via Expat App&body=Hello ${encodeURIComponent(mentor.name)},%0D%0A%0D%0AI would love to get your advice regarding...`;
  };

  return (
    <div className={styles.card}>
      <div>
        <div className={styles.header}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.mentorInfo}>
            <h3>{mentor.name}</h3>
            <p className={styles.role}>{mentor.profession}</p>
          </div>
        </div>

        <div className={styles.statsRow}>
          <Tag value={mentor.municipalityId.toUpperCase()} severity="info" />
          <Tag value={`${mentor.yearsInFinland} ${t('mentor.in_finland', 'years in Finland')}`} severity="success" />
          <Tag value={`${t('mentor.origin', 'From')}: ${mentor.originCountry}`} severity="warning" />
        </div>

        <p className={styles.bio}>{mentor.bio}</p>

        <div className={styles.specialtiesArea}>
          <div className={styles.specialtiesLabel}>{t('mentor.specialties', 'Can advise on')}:</div>
          <div className={styles.specialtyTags}>
            {mentor.specialties.map((spec) => (
              <span key={spec} className={styles.specialtyTag}>
                {spec}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.languages}>
          <i className="pi pi-comments" />
          <span>{mentor.languages.join(', ')}</span>
        </div>

        <Button
          label={t('mentor.contact_btn', 'Contact Mentor')}
          icon="pi pi-envelope"
          size="small"
          onClick={handleContact}
        />
      </div>
    </div>
  );
};

export default MentorCard;
