import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from 'primereact/tag';
import type { ServiceTicket, ServiceTicketStatus } from '@/types/serviceRequest';
import styles from './TicketCard.module.scss';

interface Props {
  ticket: ServiceTicket;
}

const STATUS_ORDER: ServiceTicketStatus[] = ['submitted', 'under_review', 'in_progress', 'resolved'];

export const TicketCard: React.FC<Props> = ({ ticket }) => {
  const { t } = useTranslation('serviceRequests');

  const currentIdx = STATUS_ORDER.indexOf(ticket.status);

  const getStatusSeverity = (status: ServiceTicketStatus) => {
    switch (status) {
      case 'submitted':
        return 'info';
      case 'under_review':
        return 'warning';
      case 'in_progress':
        return undefined;
      case 'resolved':
        return 'success';
    }
  };

  const getPrioritySeverity = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  const statusLabel = t(`filters.statuses.${ticket.status}`, ticket.status);
  const categoryLabel = t(`filters.categories.${ticket.category}`, ticket.category);
  const priorityLabel = t(`filters.priorities.${ticket.priority}`, ticket.priority);

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={`${styles.ticketCard} ${ticket.status === 'resolved' ? styles.resolved : ''}`}>
      <div className={styles.topRow}>
        <div className={styles.badges}>
          <span className={styles.refTag}>{ticket.referenceNumber}</span>
          <Tag value={ticket.municipalityId.toUpperCase()} severity="info" />
          <Tag value={categoryLabel} />
          <Tag value={statusLabel} severity={getStatusSeverity(ticket.status)} />
          <Tag value={priorityLabel} severity={getPrioritySeverity(ticket.priority)} />
        </div>
      </div>

      <div className={styles.headerContent}>
        <h3>{ticket.title}</h3>
        <p>{ticket.description}</p>
      </div>

      <div className={styles.timeline}>
        {STATUS_ORDER.map((stage, idx) => {
          const isPassed = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFinal = stage === 'resolved' && currentIdx === 3;

          let stepClass = '';
          if (isFinal) {
            stepClass = styles.resolved;
          } else if (isCurrent) {
            stepClass = styles.current;
          } else if (isPassed) {
            stepClass = styles.completed;
          }

          return (
            <div key={stage} className={`${styles.timelineStep} ${stepClass}`}>
              <div className={styles.dot}>
                {isPassed || isFinal ? (
                  <i className="pi pi-check" style={{ fontSize: '0.65rem' }} />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span className={styles.stepLabel}>
                {t(`filters.statuses.${stage}`, stage)}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.label}>{t('ticket.dept', 'Department')}</span>
          <span className={styles.val}>{ticket.assignedDepartment}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.label}>{t('ticket.submitted_on', 'Submitted')}</span>
          <span className={styles.val}>{formattedDate}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.label}>{t('ticket.est_time', 'Est. resolution')}</span>
          <span className={styles.val}>
            {ticket.estimatedResolutionDays} {t('ticket.days', 'business days')}
          </span>
        </div>
      </div>

      {ticket.officialResponse && (
        <div className={styles.responseBox}>
          <div className={styles.responseHeader}>
            <i className="pi pi-check-circle" />
            <span>{t('ticket.official_response', 'Official Municipal Response')}</span>
          </div>
          <p className={styles.responseText}>{ticket.officialResponse}</p>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
