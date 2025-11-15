import { memo } from 'react';
import classNames from 'classnames';
import styles from './SkillLevelSelector.module.scss';

export const SKILL_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

interface SkillLevelSelectorProps {
  value: SkillLevel;
  onChange?: (level: SkillLevel) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const SkillLevelSelectorComponent = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}: SkillLevelSelectorProps) => {
  const currentIndex = SKILL_LEVELS.findIndex((level) => level === value);

  return (
    <div
      className={classNames(styles.wrapper, styles[size], className, {
        [styles.readOnly]: readOnly,
      })}
      role={readOnly ? undefined : 'radiogroup'}
      aria-label="Skill level"
    >
      {SKILL_LEVELS.map((level, index) => {
        const isActive = index <= currentIndex;
        const isSelected = level === value;
        const sharedProps = {
          key: level,
          className: classNames(styles.segment, {
            [styles.active]: isActive,
            [styles.selected]: isSelected,
          }),
          'data-level': level,
        };

        if (readOnly) {
          return (
            <div {...sharedProps}>
              <span className={styles.levelLabel}>{level}</span>
            </div>
          );
        }

        return (
          <button
            {...sharedProps}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange?.(level)}
          >
            <span className={styles.levelLabel}>{level}</span>
          </button>
        );
      })}
    </div>
  );
};

const SkillLevelSelector = memo(SkillLevelSelectorComponent);

export default SkillLevelSelector;






