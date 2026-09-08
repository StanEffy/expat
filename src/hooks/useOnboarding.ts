import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  OnboardingAnswers,
  OnboardingTask,
  TaskPhase,
  TaskCategory,
} from '@/types/onboarding';
import { filterTasksForUser } from '@/constants/onboardingData';
import { onboardingService } from '@/services/onboardingService';

export function useOnboarding() {
  const [answers, setAnswersState] = useState<OnboardingAnswers | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<TaskPhase | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = onboardingService.getProgress();
    if (saved) {
      setAnswersState(saved.answers);
      setCompletedTaskIds(saved.completedTaskIds);
    }
    setIsLoaded(true);
  }, []);

  const allApplicableTasks: OnboardingTask[] = useMemo(() => {
    if (!answers) return [];
    return filterTasksForUser(answers);
  }, [answers]);

  const filteredTasks: OnboardingTask[] = useMemo(() => {
    return allApplicableTasks.filter((task) => {
      if (selectedPhase !== 'all' && task.phase !== selectedPhase) {
        return false;
      }
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }
      const isCompleted = completedTaskIds.includes(task.id);
      if (filterStatus === 'completed' && !isCompleted) {
        return false;
      }
      if (filterStatus === 'pending' && isCompleted) {
        return false;
      }
      return true;
    });
  }, [allApplicableTasks, selectedPhase, selectedCategory, filterStatus, completedTaskIds]);

  const setAnswers = useCallback((newAnswers: OnboardingAnswers) => {
    setAnswersState(newAnswers);
    const progress = {
      answers: newAnswers,
      completedTaskIds: [],
      lastUpdated: new Date().toISOString(),
    };
    onboardingService.saveProgress(progress);
    setCompletedTaskIds([]);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setCompletedTaskIds((prev) => {
      const exists = prev.includes(taskId);
      const updated = exists ? prev.filter((id) => id !== taskId) : [...prev, taskId];
      if (answers) {
        onboardingService.saveProgress({
          answers,
          completedTaskIds: updated,
          lastUpdated: new Date().toISOString(),
        });
      }
      return updated;
    });
  }, [answers]);

  const resetWizard = useCallback(() => {
    onboardingService.clearProgress();
    setAnswersState(null);
    setCompletedTaskIds([]);
    setSelectedPhase('all');
    setSelectedCategory('all');
    setFilterStatus('all');
  }, []);

  const stats = useMemo(() => {
    const total = allApplicableTasks.length;
    const completed = allApplicableTasks.filter((t) => completedTaskIds.includes(t.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [allApplicableTasks, completedTaskIds]);

  return {
    isLoaded,
    isConfigured: answers !== null,
    answers,
    tasks: filteredTasks,
    allTasks: allApplicableTasks,
    completedTaskIds,
    selectedPhase,
    selectedCategory,
    filterStatus,
    stats,
    setAnswers,
    toggleTask,
    resetWizard,
    setSelectedPhase,
    setSelectedCategory,
    setFilterStatus,
  };
}
