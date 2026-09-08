import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import type {
  CreateServiceTicketInput,
  ServiceTicketCategory,
  ServiceTicketPriority,
} from '@/types/serviceRequest';
import type { MunicipalityId } from '@/types/onboarding';
import styles from './NewTicketDialog.module.scss';

interface Props {
  visible: boolean;
  onHide: () => void;
  onSubmit: (ticket: CreateServiceTicketInput) => void;
}

export const NewTicketDialog: React.FC<Props> = ({ visible, onHide, onSubmit }) => {
  const { t } = useTranslation('serviceRequests');

  const [municipalityId, setMunicipalityId] = useState<MunicipalityId>('helsinki');
  const [category, setCategory] = useState<ServiceTicketCategory>('daycare_school');
  const [priority, setPriority] = useState<ServiceTicketPriority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const cityOptions: { label: string; value: MunicipalityId }[] = [
    { label: 'Helsinki', value: 'helsinki' },
    { label: 'Espoo', value: 'espoo' },
    { label: 'Tampere', value: 'tampere' },
    { label: 'Vantaa', value: 'vantaa' },
    { label: 'Turku', value: 'turku' },
    { label: 'Oulu', value: 'oulu' },
  ];

  const categoryOptions: { label: string; value: ServiceTicketCategory }[] = [
    { label: t('filters.categories.daycare_school', 'Daycare & Schools'), value: 'daycare_school' },
    { label: t('filters.categories.housing_permits', 'Housing & Permits'), value: 'housing_permits' },
    { label: t('filters.categories.social_integration', 'Integration & Social Services'), value: 'social_integration' },
    { label: t('filters.categories.waste_environment', 'Environment & Waste'), value: 'waste_environment' },
    { label: t('filters.categories.tax_business', 'Tax & Business Services'), value: 'tax_business' },
    { label: t('filters.categories.general_inquiry', 'General Inquiry'), value: 'general_inquiry' },
  ];

  const priorityOptions: { label: string; value: ServiceTicketPriority }[] = [
    { label: t('filters.priorities.low', 'Standard'), value: 'low' },
    { label: t('filters.priorities.medium', 'Normal'), value: 'medium' },
    { label: t('filters.priorities.high', 'Urgent'), value: 'high' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmit({
      municipalityId,
      category,
      priority,
      title: title.trim(),
      description: description.trim(),
      userEmail: userEmail.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setUserEmail('');
    onHide();
  };

  return (
    <Dialog
      header={t('dialog.title', 'Submit New Municipal Request')}
      visible={visible}
      style={{ width: '90vw', maxWidth: '640px' }}
      onHide={onHide}
      modal
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="dialog-city">{t('dialog.city_label', 'Target Municipality')}</label>
            <Dropdown
              id="dialog-city"
              value={municipalityId}
              options={cityOptions}
              onChange={(e) => setMunicipalityId(e.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="dialog-category">{t('dialog.category_label', 'Service Category')}</label>
            <Dropdown
              id="dialog-category"
              value={category}
              options={categoryOptions}
              onChange={(e) => setCategory(e.value)}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="dialog-priority">{t('dialog.priority_label', 'Urgency / Priority')}</label>
            <Dropdown
              id="dialog-priority"
              value={priority}
              options={priorityOptions}
              onChange={(e) => setPriority(e.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="dialog-email">{t('dialog.email_label', 'Contact Email')}</label>
            <InputText
              id="dialog-email"
              type="email"
              placeholder={t('dialog.email_placeholder', 'your.email@example.com')}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="dialog-title">{t('dialog.ticket_title_label', 'Request Subject')}</label>
          <InputText
            id="dialog-title"
            required
            placeholder={t('dialog.ticket_title_placeholder', 'Brief title summarizing your inquiry...')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="dialog-desc">{t('dialog.ticket_desc_label', 'Details & Background')}</label>
          <InputTextarea
            id="dialog-desc"
            required
            rows={4}
            placeholder={t('dialog.ticket_desc_placeholder', 'Describe what you need help with...')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.footer}>
          <Button
            type="button"
            label={t('dialog.cancel', 'Cancel')}
            severity="secondary"
            outlined
            onClick={onHide}
          />
          <Button
            type="submit"
            label={t('dialog.submit', 'Send Request')}
            icon="pi pi-send"
            disabled={!title.trim() || !description.trim()}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default NewTicketDialog;
