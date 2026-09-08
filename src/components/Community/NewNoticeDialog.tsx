import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import type { NoticeBoardPost, NoticeCategory } from '@/types/community';
import type { MunicipalityId } from '@/types/onboarding';
import styles from './NewNoticeDialog.module.scss';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSubmit: (notice: Omit<NoticeBoardPost, 'id' | 'createdAt'>) => void;
}

export const NewNoticeDialog: React.FC<Props> = ({ visible, onHide, onSubmit }) => {
  const { t } = useTranslation('community');

  const [municipalityId, setMunicipalityId] = useState<MunicipalityId>('helsinki');
  const [category, setCategory] = useState<NoticeCategory>('study_buddy');
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');

  const cityOptions: { label: string; value: MunicipalityId }[] = [
    { label: 'Helsinki', value: 'helsinki' },
    { label: 'Espoo', value: 'espoo' },
    { label: 'Tampere', value: 'tampere' },
    { label: 'Vantaa', value: 'vantaa' },
    { label: 'Turku', value: 'turku' },
    { label: 'Oulu', value: 'oulu' },
  ];

  const categoryOptions: { label: string; value: NoticeCategory }[] = [
    { label: t('filters.notice_categories.housing_sharing', 'Housing & Flatmates'), value: 'housing_sharing' },
    { label: t('filters.notice_categories.goods_giveaway', 'Free & Secondhand'), value: 'goods_giveaway' },
    { label: t('filters.notice_categories.study_buddy', 'Study & Language'), value: 'study_buddy' },
    { label: t('filters.notice_categories.advice', 'General Advice'), value: 'advice' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !contact.trim() || !author.trim()) return;

    onSubmit({
      municipalityId,
      category,
      author: author.trim(),
      title: title.trim(),
      content: content.trim(),
      contact: contact.trim(),
    });

    setTitle('');
    setContent('');
    setContact('');
    setAuthor('');
    onHide();
  };

  return (
    <Dialog
      header={t('notice.dialog.title', 'Post on Community Notice Board')}
      visible={visible}
      style={{ width: '90vw', maxWidth: '640px' }}
      onHide={onHide}
      modal
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="notice-city">{t('notice.dialog.city_label', 'City')}</label>
            <Dropdown
              id="notice-city"
              value={municipalityId}
              options={cityOptions}
              onChange={(e) => setMunicipalityId(e.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="notice-cat">{t('notice.dialog.category_label', 'Category')}</label>
            <Dropdown
              id="notice-cat"
              value={category}
              options={categoryOptions}
              onChange={(e) => setCategory(e.value)}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="notice-author">{t('notice.dialog.author_label', 'Your Name / Nickname')}</label>
            <InputText
              id="notice-author"
              required
              placeholder={t('notice.dialog.author_placeholder', 'e.g., Alex K.')}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="notice-contact">{t('notice.dialog.contact_label', 'Contact Info')}</label>
            <InputText
              id="notice-contact"
              required
              placeholder={t('notice.dialog.contact_placeholder', 'alex@example.com or @alex_tg')}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="notice-title">{t('notice.dialog.post_title_label', 'Notice Title')}</label>
          <InputText
            id="notice-title"
            required
            placeholder={t('notice.dialog.post_title_placeholder', 'Clear and concise title...')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="notice-content">{t('notice.dialog.content_label', 'Notice Content')}</label>
          <InputTextarea
            id="notice-content"
            required
            rows={4}
            placeholder={t('notice.dialog.content_placeholder', 'Provide details, conditions, timing, location...')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className={styles.footer}>
          <Button
            type="button"
            label={t('notice.dialog.cancel', 'Cancel')}
            severity="secondary"
            outlined
            onClick={onHide}
          />
          <Button
            type="submit"
            label={t('notice.dialog.submit', 'Post Notice')}
            icon="pi pi-check"
            disabled={!title.trim() || !content.trim() || !contact.trim() || !author.trim()}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default NewNoticeDialog;
