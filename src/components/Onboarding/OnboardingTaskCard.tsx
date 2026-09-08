import React from 'react';
import { useTranslation } from 'react-i18next';
import type { OnboardingTask, MunicipalityId } from '@/types/onboarding';
import styles from './OnboardingTaskCard.module.scss';

interface Props {
  task: OnboardingTask;
  isCompleted: boolean;
  municipalityId: MunicipalityId;
  onToggle: (taskId: string) => void;
}

export const OnboardingTaskCard: React.FC<Props> = ({
  task,
  isCompleted,
  municipalityId,
  onToggle,
}) => {
  const { t } = useTranslation('onboarding');

  const cleanTitleKey = task.titleKey?.replace(/^onboarding\./, '') || `tasks.${task.id}.title`;
  const cleanDescKey = task.descriptionKey?.replace(/^onboarding\./, '') || `tasks.${task.id}.description`;
  const fallbackTitle = 'title' in task && typeof (task as Record<string, unknown>).title === 'string'
    ? (task as Record<string, unknown>).title as string
    : task.id;
  const fallbackDesc = 'description' in task && typeof (task as Record<string, unknown>).description === 'string'
    ? (task as Record<string, unknown>).description as string
    : '';
  const title = t(cleanTitleKey, { defaultValue: fallbackTitle });
  const description = t(cleanDescKey, { defaultValue: fallbackDesc });
  const municipalNote = task.municipalNotes?.[municipalityId];

  return (
    <div className={`${styles.card} ${isCompleted ? styles.completed : ''}`}>
      <div className={styles.topRow}>
        <button
          type="button"
          className={`${styles.checkboxBtn} ${isCompleted ? styles.checked : ''}`}
          onClick={() => onToggle(task.id)}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <i className="pi pi-check" />
        </button>

        <div className={styles.mainContent}>
          <div className={styles.badgesRow}>
            <span className={`${styles.badge} ${styles[task.priority]}`}>
              {t(`priorities.${task.priority}`, task.priority)}
            </span>
            <span className={`${styles.badge} ${styles.phase}`}>
              {t(`phases.${task.phase}`, task.phase)}
            </span>
            <span className={`${styles.badge} ${styles.category}`}>
              {t(`categories.${task.category}`, task.category)}
            </span>

            {task.estimatedDays && (
              <div className={styles.estimatedTime}>
                <i className="pi pi-clock" />
                <span>{task.estimatedDays}</span>
              </div>
            )}
          </div>

          <h3 className={styles.taskTitle}>{title}</h3>
          <p className={styles.taskDescription}>{description}</p>

          {municipalNote && (
            <div className={styles.municipalNote}>
              <i className="pi pi-map-marker" />
              <div>
                <strong>{t('checklist.local_tip')} {municipalityId.toUpperCase()}: </strong>
                {municipalNote}
              </div>
            </div>
          )}

          {task.requiredDocuments && task.requiredDocuments.length > 0 && (
            <div className={styles.documentsSection}>
              <div className={styles.docsTitle}>
                <i className="pi pi-file" />
                <span>{t('checklist.required_documents')}</span>
              </div>
              <div className={styles.docsList}>
                {task.requiredDocuments.map((docKey) => (
                  <span key={docKey} className={styles.docPill}>
                    {docKey.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.officialLinks && task.officialLinks.length > 0 && (
            <div className={styles.linksRow}>
              {task.officialLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.linkBtn} ${link.isOfficial ? styles.official : ''}`}
                >
                  <i className={link.isOfficial ? 'pi pi-verified' : 'pi pi-external-link'} />
                  {link.title}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTaskCard;
