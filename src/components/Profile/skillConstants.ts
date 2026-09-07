export type SkillScaleType = 'trade' | 'language' | 'grade';

export interface SkillLevelOption {
  value: string;
  label: string;
  hint: string;
}

export const SKILL_SCALES: Record<
  SkillScaleType,
  {
    id: SkillScaleType;
    label: string;
    icon: string;
    options: SkillLevelOption[];
  }
> = {
  trade: {
    id: 'trade',
    label: 'Квалификация (1–5)',
    icon: 'pi pi-wrench',
    options: [
      { value: '1', label: '1', hint: '1: Начальный (1-й разряд)' },
      { value: '2', label: '2', hint: '2: Базовый (2–3 разряд)' },
      { value: '3', label: '3', hint: '3: Средний (4-й разряд)' },
      { value: '4', label: '4', hint: '4: Опытный (5-й разряд)' },
      { value: '5', label: '5', hint: '5: Мастер (6-й разряд)' },
    ],
  },
  language: {
    id: 'language',
    label: 'Язык (A1–C2)',
    icon: 'pi pi-globe',
    options: [
      { value: 'A1', label: 'A1', hint: 'A1: Начальный (Beginner)' },
      { value: 'A2', label: 'A2', hint: 'A2: Элементарный (Elementary)' },
      { value: 'B1', label: 'B1', hint: 'B1: Средний (Intermediate)' },
      { value: 'B2', label: 'B2', hint: 'B2: Выше среднего (Upper-Int)' },
      { value: 'C1', label: 'C1', hint: 'C1: Продвинутый (Advanced)' },
      { value: 'C2', label: 'C2', hint: 'C2: Свободный (Proficiency)' },
    ],
  },
  grade: {
    id: 'grade',
    label: 'Грейд (Jr–Lead)',
    icon: 'pi pi-briefcase',
    options: [
      { value: 'Junior', label: 'Junior', hint: 'Junior (Начинающий специалист)' },
      { value: 'Middle', label: 'Middle', hint: 'Middle (Специалист)' },
      { value: 'Senior', label: 'Senior', hint: 'Senior (Старший специалист)' },
      { value: 'Lead', label: 'Lead', hint: 'Lead (Ведущий / Эксперт / Мастер)' },
    ],
  },
};

export const ALL_SKILL_LEVELS = [
  '1', '2', '3', '4', '5',
  'A1', 'A2', 'B1', 'B2', 'C1', 'C2',
  'Junior', 'Middle', 'Senior', 'Lead'
] as const;

export const SKILL_LEVELS = ALL_SKILL_LEVELS;
export type SkillLevel = string;

export const detectScaleFromLevel = (level: string): SkillScaleType => {
  if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level)) return 'language';
  if (['Junior', 'Middle', 'Senior', 'Lead'].includes(level)) return 'grade';
  return 'trade';
};

export const getSkillLevelHint = (level: string): string => {
  for (const scale of Object.values(SKILL_SCALES)) {
    const found = scale.options.find((opt) => opt.value === level);
    if (found) return found.hint;
  }
  return level;
};

