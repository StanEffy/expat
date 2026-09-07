import { memo, useMemo, useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from './SkillLevelSelector.module.scss';
import SkillScaleTabs from './SkillScaleTabs';
import {
  SkillLevel,
  SkillScaleType,
  SKILL_SCALES,
  detectScaleFromLevel,
} from './skillConstants';

interface SkillLevelSelectorProps {
  value: SkillLevel;
  onChange?: (level: SkillLevel) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  hideScaleTabs?: boolean;
  hideHint?: boolean;
}

const SkillLevelSelectorComponent = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  className,
  hideScaleTabs = false,
  hideHint = false,
}: SkillLevelSelectorProps) => {
  const detectedScale = useMemo(() => detectScaleFromLevel(value), [value]);
  const [activeScale, setActiveScale] = useState<SkillScaleType>(detectedScale);

  useEffect(() => {
    setActiveScale(detectedScale);
  }, [detectedScale]);

  const currentScaleConfig = SKILL_SCALES[activeScale] || SKILL_SCALES.trade;
  const options = currentScaleConfig.options;

  const currentIndex = useMemo(() => {
    const idx = options.findIndex((opt) => opt.value === value);
    return idx >= 0 ? idx : 0;
  }, [options, value]);

  const currentOption = options[currentIndex] || options[0];

  const handleScaleChange = (newScale: SkillScaleType) => {
    setActiveScale(newScale);
    const newOptions = SKILL_SCALES[newScale].options;
    const defaultIdx = Math.floor(newOptions.length / 2);
    const newLevel = newOptions[defaultIdx].value;
    onChange?.(newLevel);
  };

  return (
    <div
      className={classNames(styles.container, styles[size], className, {
        [styles.readOnly]: readOnly,
      })}
    >
      {/* Scale Switcher Tabs (Only in edit/add mode when not hidden) */}
      {!readOnly && !hideScaleTabs && (
        <SkillScaleTabs
          activeScale={activeScale}
          onChange={handleScaleChange}
        />
      )}

      {/* Level Segments Row */}
      <div
        className={styles.wrapper}
        role={readOnly ? undefined : 'radiogroup'}
        aria-label="Skill level"
      >
        {options.map((opt, index) => {
          const isActive = index <= currentIndex;
          const isSelected = opt.value === value;
          const sharedProps = {
            key: opt.value,
            className: classNames(styles.segment, {
              [styles.active]: isActive,
              [styles.selected]: isSelected,
            }),
            'data-level': opt.value,
            title: opt.hint,
          };

          if (readOnly) {
            return (
              <div {...sharedProps}>
                <span className={styles.levelLabel}>{opt.label}</span>
              </div>
            );
          }

          return (
            <button
              {...sharedProps}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange?.(opt.value)}
            >
              <span className={styles.levelLabel}>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected level hint description (only in full edit mode when not hidden) */}
      {!readOnly && !hideHint && currentOption && (
        <div className={styles.levelHint}>
          <i className="pi pi-info-circle" />
          <span>{currentOption.hint}</span>
        </div>
      )}
    </div>
  );
};

const SkillLevelSelector = memo(SkillLevelSelectorComponent);

export default SkillLevelSelector;








