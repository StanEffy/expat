import type { UserOnboardingProgress, OnboardingTask } from '@/types/onboarding';

const STORAGE_KEY = 'expat_onboarding_progress_v1';

export const onboardingService = {
  getProgress(): UserOnboardingProgress | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as UserOnboardingProgress;
    } catch (e) {
      console.error('Failed to load onboarding progress from localStorage', e);
      return null;
    }
  },

  saveProgress(progress: UserOnboardingProgress): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save onboarding progress to localStorage', e);
    }
  },

  toggleTask(taskId: string): UserOnboardingProgress | null {
    const current = this.getProgress();
    if (!current) return null;

    const exists = current.completedTaskIds.includes(taskId);
    const updatedTaskIds = exists
      ? current.completedTaskIds.filter((id) => id !== taskId)
      : [...current.completedTaskIds, taskId];

    const updated: UserOnboardingProgress = {
      ...current,
      completedTaskIds: updatedTaskIds,
      lastUpdated: new Date().toISOString(),
    };

    this.saveProgress(updated);
    return updated;
  },

  clearProgress(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear onboarding progress', e);
    }
  },

  generatePrintableText(progress: UserOnboardingProgress, tasks: OnboardingTask[]): string {
    const lines: string[] = [];
    lines.push('==================================================');
    lines.push(`EXPAT FINLAND - MUNICIPAL ONBOARDING CHECKLIST`);
    lines.push(`Municipality: ${progress.answers.municipality.toUpperCase()}`);
    lines.push(`Date: ${new Date().toLocaleDateString()}`);
    lines.push(
      `Progress: ${progress.completedTaskIds.length} / ${tasks.length} completed (${Math.round(
        (progress.completedTaskIds.length / (tasks.length || 1)) * 100,
      )}%)`,
    );
    lines.push('==================================================\n');

    tasks.forEach((task, idx) => {
      const done = progress.completedTaskIds.includes(task.id);
      lines.push(`[${done ? 'X' : ' '}] ${idx + 1}. ${task.id.replace(/_/g, ' ').toUpperCase()}`);
      lines.push(`    Phase: ${task.phase} | Priority: ${task.priority}`);
      if (task.estimatedDays) {
        lines.push(`    Estimated time: ${task.estimatedDays}`);
      }
      if (task.officialLinks.length > 0) {
        lines.push(`    Links: ${task.officialLinks.map((l) => `${l.title} (${l.url})`).join(', ')}`);
      }
      lines.push('');
    });

    return lines.join('\n');
  },
};
