import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { registerServiceRequestsTranslations } from '@/i18n/registerServiceRequests';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { TicketCard } from '@/components/ServiceRequests/TicketCard';
import { NewTicketDialog } from '@/components/ServiceRequests/NewTicketDialog';
import type { MunicipalityId } from '@/types/onboarding';
import type { ServiceTicketStatus, ServiceTicketCategory } from '@/types/serviceRequest';
import styles from './ServiceRequests.module.scss';

registerServiceRequestsTranslations();

export const ServiceRequests: React.FC = () => {
  const { t } = useTranslation('serviceRequests');
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    registerServiceRequestsTranslations();
  }, []);

  const {
    isLoaded,
    tickets,
    counts,
    selectedCity,
    selectedStatus,
    selectedCategory,
    searchQuery,
    setCity,
    setStatus,
    setCategory,
    setSearchQuery,
    createTicket,
    resetTickets,
  } = useServiceRequests();

  const cityOptions: { label: string; value: MunicipalityId | 'all' }[] = [
    { label: t('filters.city_all', 'All Cities'), value: 'all' },
    { label: 'Helsinki', value: 'helsinki' },
    { label: 'Espoo', value: 'espoo' },
    { label: 'Tampere', value: 'tampere' },
    { label: 'Vantaa', value: 'vantaa' },
    { label: 'Turku', value: 'turku' },
    { label: 'Oulu', value: 'oulu' },
  ];

  const categoryOptions: { label: string; value: ServiceTicketCategory | 'all' }[] = [
    { label: t('filters.category_all', 'All Categories'), value: 'all' },
    { label: t('filters.categories.daycare_school', 'Daycare & Schools'), value: 'daycare_school' },
    { label: t('filters.categories.housing_permits', 'Housing & Permits'), value: 'housing_permits' },
    { label: t('filters.categories.social_integration', 'Integration & Social Services'), value: 'social_integration' },
    { label: t('filters.categories.waste_environment', 'Environment & Waste'), value: 'waste_environment' },
    { label: t('filters.categories.tax_business', 'Tax & Business Services'), value: 'tax_business' },
    { label: t('filters.categories.general_inquiry', 'General Inquiry'), value: 'general_inquiry' },
  ];

  const statusList: { key: ServiceTicketStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: t('filters.status_all', 'All Statuses'), count: counts.all },
    { key: 'submitted', label: t('filters.statuses.submitted', 'Submitted'), count: counts.submitted },
    { key: 'under_review', label: t('filters.statuses.under_review', 'Under Review'), count: counts.under_review },
    { key: 'in_progress', label: t('filters.statuses.in_progress', 'In Progress'), count: counts.in_progress },
    { key: 'resolved', label: t('filters.statuses.resolved', 'Resolved'), count: counts.resolved },
  ];

  if (!isLoaded) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div className={styles.titleArea}>
          <h1>{t('title', 'Municipal Service Request Tracker')}</h1>
          <p>{t('subtitle', 'Submit inquiries directly to city departments and track resolution status in real time')}</p>
        </div>
        <div className={styles.actionBtnArea}>
          <Button
            label={t('new_ticket_btn', 'Submit Service Request')}
            icon="pi pi-plus"
            onClick={() => setDialogVisible(true)}
          />
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            tooltip="Reset sample tickets"
            onClick={resetTickets}
          />
        </div>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchInput}>
            <span className="p-input-icon-left" style={{ width: '100%' }}>
              <i className="pi pi-search" />
              <InputText
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', 'Search tickets by title, reference ID, or keyword...')}
                style={{ width: '100%' }}
              />
            </span>
          </div>

          <div className={styles.filterControls}>
            <div className={styles.filterField}>
              <label htmlFor="city-filter">City:</label>
              <Dropdown
                id="city-filter"
                value={selectedCity}
                options={cityOptions}
                onChange={(e) => setCity(e.value)}
              />
            </div>

            <div className={styles.filterField}>
              <label htmlFor="cat-filter">Category:</label>
              <Dropdown
                id="cat-filter"
                value={selectedCategory}
                options={categoryOptions}
                onChange={(e) => setCategory(e.value)}
              />
            </div>
          </div>
        </div>

        <div className={styles.statusTabs}>
          {statusList.map((st) => {
            const isActive = selectedStatus === st.key;
            return (
              <button
                type="button"
                key={st.key}
                className={`${styles.statusTab} ${isActive ? styles.active : ''}`}
                onClick={() => setStatus(st.key)}
              >
                <span>{st.label}</span>
                <span className={styles.countBadge}>{st.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="pi pi-folder-open" />
          <h3>{t('empty.title', 'No service requests found')}</h3>
          <p>{t('empty.desc', 'Adjust your filters or submit a new inquiry using the button above.')}</p>
        </div>
      ) : (
        <div className={styles.ticketList}>
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      <NewTicketDialog
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        onSubmit={createTicket}
      />
    </div>
  );
};

export default ServiceRequests;
