import React from 'react';
import { useTranslation } from 'react-i18next';
import type {
  OnboardingAnswers,
  OnboardingTask,
  TaskPhase,
  TaskCategory,
} from '@/types/onboarding';
import { MunicipalWelcomeBanner } from './MunicipalWelcomeBanner';
import { OnboardingTaskCard } from './OnboardingTaskCard';
import { onboardingService } from '@/services/onboardingService';
import styles from './OnboardingChecklist.module.scss';

interface Props {
  answers: OnboardingAnswers;
  tasks: OnboardingTask[];
  allTasks: OnboardingTask[];
  completedTaskIds: string[];
  stats: { total: number; completed: number; percentage: number };
  selectedPhase: TaskPhase | 'all';
  selectedCategory: TaskCategory | 'all';
  filterStatus: 'all' | 'pending' | 'completed';
  onToggleTask: (taskId: string) => void;
  onReset: () => void;
  onSelectPhase: (phase: TaskPhase | 'all') => void;
  onSelectCategory: (category: TaskCategory | 'all') => void;
  onSelectFilterStatus: (status: 'all' | 'pending' | 'completed') => void;
}

export const OnboardingChecklist: React.FC<Props> = ({
  answers,
  tasks,
  allTasks,
  completedTaskIds,
  stats,
  selectedPhase,
  selectedCategory,
  filterStatus,
  onToggleTask,
  onReset,
  onSelectPhase,
  onSelectCategory,
  onSelectFilterStatus,
}) => {
  const { t } = useTranslation('onboarding');

  const handleExport = () => {
    const text = onboardingService.generatePrintableText(
      {
        answers,
        completedTaskIds,
        lastUpdated: new Date().toISOString(),
      },
      allTasks,
    );

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expat-onboarding-${answers.municipality}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const phasesList: (TaskPhase | 'all')[] = [
    'all',
    'before_arrival',
    'first_days',
    'first_month',
    'settled',
  ];

  const categoriesList: (TaskCategory | 'all')[] = [
    'all',
    'legal',
    'tax_finance',
    'healthcare',
    'family_education',
    'housing',
    'integration_language',
    'daily_life',
  ];

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.topRow}>
          <div className={styles.titleArea}>
            <h2>{t('checklist.title')}</h2>
            <div className={styles.metaInfo}>
              <span>
                <i className="pi pi-map-marker" style={{ marginRight: '0.3rem' }} />
                {t(`wizard.municipalities.${answers.municipality}`)}
              </span>
              <span>{t(`wizard.citizenships.${answers.citizenship}`)}</span>
              <span>{t(`wizard.reasons.${answers.reason}`)}</span>
              <span>{t(`wizard.family.${answers.family}`)}</span>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleExport}
              title="Download text report"
            >
              <i className="pi pi-download" />
              {t('checklist.export_btn')}
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handlePrint}
              title="Print checklist"
            >
              <i className="pi pi-print" />
              Print
            </button>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.danger}`}
              onClick={onReset}
              title="Restart wizard"
            >
              <i className="pi pi-refresh" />
              {t('checklist.reset_btn')}
            </button>
          </div>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressHeader}>
            <span>
              {t('checklist.progress_label')}: {stats.completed} / {stats.total}
            </span>
            <span className={styles.percentage}>{stats.percentage}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${stats.percentage}%` }} />
          </div>
        </div>
      </div>

      {stats.percentage === 100 && stats.total > 0 && (
        <div className={styles.celebrationCard}>
          <h3>{t('checklist.all_done_title')}</h3>
          <p>{t('checklist.all_done_desc')}</p>
        </div>
      )}

      <MunicipalWelcomeBanner municipalityId={answers.municipality} />

      <div className={styles.filtersCard}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Phase:</span>
          <div className={styles.chipsList}>
            {phasesList.map((phase) => (
              <button
                key={phase}
                type="button"
                className={`${styles.chipBtn} ${selectedPhase === phase ? styles.active : ''}`}
                onClick={() => onSelectPhase(phase)}
              >
                {t(`phases.${phase}`)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Category:</span>
          <div className={styles.chipsList}>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.chipBtn} ${selectedCategory === cat ? styles.active : ''}`}
                onClick={() => onSelectCategory(cat)}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Status:</span>
          <div className={styles.chipsList}>
            {(['all', 'pending', 'completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                className={`${styles.chipBtn} ${filterStatus === status ? styles.active : ''}`}
                onClick={() => onSelectFilterStatus(status)}
              >
                {t(`checklist.filter_${status}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.tasksList}>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <OnboardingTaskCard
              key={task.id}
              task={task}
              isCompleted={completedTaskIds.includes(task.id)}
              municipalityId={answers.municipality}
              onToggle={onToggleTask}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <i className="pi pi-filter-slash" />
            <p>No tasks match your selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingChecklist;
