import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import type { NoticeBoardPost } from '@/types/community';
import styles from './NoticeCard.module.scss';

interface Props {
  notice: NoticeBoardPost;
}

export const NoticeCard: React.FC<Props> = ({ notice }) => {
  const { t } = useTranslation('community');

  const categoryLabel = t(`filters.notice_categories.${notice.category}`, notice.category);

  const formattedDate = new Date(notice.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const handleContact = () => {
    if (notice.contact.includes('@') && !notice.contact.startsWith('@')) {
      window.location.href = `mailto:${notice.contact}?subject=Regarding your notice: ${encodeURIComponent(notice.title)}`;
    } else {
      navigator.clipboard.writeText(notice.contact);
      alert(`Contact info copied: ${notice.contact}`);
    }
  };

  const getCategorySeverity = (cat: string) => {
    switch (cat) {
      case 'housing_sharing':
        return 'info';
      case 'goods_giveaway':
        return 'success';
      case 'study_buddy':
        return 'warning';
      default:
        return undefined;
    }
  };

  return (
    <div className={styles.card}>
      <div>
        <div className={styles.header}>
          <div className={styles.badges}>
            <Tag value={notice.municipalityId.toUpperCase()} severity="info" />
            <Tag value={categoryLabel} severity={getCategorySeverity(notice.category)} />
          </div>
          <div className={styles.authorDate}>
            <i className="pi pi-user" />
            <span>{notice.author} • {formattedDate}</span>
          </div>
        </div>

        <h3 className={styles.title}>{notice.title}</h3>
        <p className={styles.content}>{notice.content}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.contactInfo}>
          <i className="pi pi-envelope" />
          <span>{notice.contact}</span>
        </div>

        <Button
          label={t('notice.contact_btn', 'Contact Author')}
          icon="pi pi-send"
          size="small"
          outlined
          onClick={handleContact}
        />
      </div>
    </div>
  );
};

export default NoticeCard;
