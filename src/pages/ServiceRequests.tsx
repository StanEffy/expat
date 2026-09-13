import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { registerServiceRequestsTranslations } from '@/i18n/registerServiceRequests';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { TicketCard } from '@/components/ServiceRequests/TicketCard';
import { NewTicketDialog } from '@/components/ServiceRequests/NewTicketDialog';
import {
  SearchInput,
  FilterDropdown,
  SegmentedControl,
  FilterCard,
  FilterRow,
  ResetButton,
  PrimaryActionButton,
} from '@/components/UI';
import type { MunicipalityId } from '@/types/onboarding';
import type { ServiceTicketCategory, ServiceTicketStatus } from '@/types/serviceRequest';
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
    selectedCity,
    selectedCategory,
    selectedStatus,
    searchQuery,
    tickets,
    counts,
    setCity,
    setCategory,
    setStatus,
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

  const statusList: { id: ServiceTicketStatus | 'all'; label: string; count: number }[] = [
    { id: 'all', label: t('filters.status_all', 'All Statuses'), count: counts.all },
    { id: 'submitted', label: t('filters.statuses.submitted', 'Submitted'), count: counts.submitted },
    { id: 'under_review', label: t('filters.statuses.under_review', 'Under Review'), count: counts.under_review },
    { id: 'in_progress', label: t('filters.statuses.in_progress', 'In Progress'), count: counts.in_progress },
    { id: 'resolved', label: t('filters.statuses.resolved', 'Resolved'), count: counts.resolved },
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
          <PrimaryActionButton
            label={t('new_ticket_btn', 'Submit Service Request')}
            icon="pi pi-plus"
            onClick={() => setDialogVisible(true)}
          />
          <ResetButton
            tooltip={t('filters.reset_tooltip', 'Reset sample tickets')}
            onClick={resetTickets}
          />
        </div>
      </div>

      <FilterCard ariaLabel="Service request filters">
        <FilterRow>
          <div className={styles.searchField}>
            <SearchInput
              id="service-request-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder', 'Search tickets by title, reference ID, or keyword...')}
              label={t('filters.search_label', 'Search')}
            />
          </div>

          <div className={styles.filterField}>
            <FilterDropdown
              id="city-filter"
              value={selectedCity}
              options={cityOptions}
              onChange={(e) => setCity(e.value)}
              label={t('filters.city_label', 'City')}
              labelIcon="pi pi-map-marker"
            />
          </div>

          <div className={styles.filterField}>
            <FilterDropdown
              id="cat-filter"
              value={selectedCategory}
              options={categoryOptions}
              onChange={(e) => setCategory(e.value)}
              label={t('filters.category_label', 'Category')}
              labelIcon="pi pi-tag"
            />
          </div>
        </FilterRow>

        <div className={styles.statusTabsWrapper}>
          <SegmentedControl
            items={statusList}
            value={selectedStatus}
            onChange={(id) => setStatus(id)}
            mobileLayout="stack"
            ariaLabel="Status filter"
          />
        </div>
      </FilterCard>

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
