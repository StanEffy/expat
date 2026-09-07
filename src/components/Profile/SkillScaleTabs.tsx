import { memo } from 'react';
import classNames from 'classnames';
import styles from './SkillLevelSelector.module.scss';
import { SkillScaleType, SKILL_SCALES } from './skillConstants';

export interface SkillScaleTabsProps {
  activeScale: SkillScaleType;
  onChange: (scale: SkillScaleType) => void;
  className?: string;
}

const SkillScaleTabsComponent = ({
  activeScale,
  onChange,
  className,
}: SkillScaleTabsProps) => {
  return (
    <div
      className={classNames(styles.scaleTabs, className)}
      role="tablist"
      aria-label="Skill Scale"
    >
      {(Object.keys(SKILL_SCALES) as SkillScaleType[]).map((scaleKey) => {
        const scale = SKILL_SCALES[scaleKey];
        const isScaleActive = scaleKey === activeScale;
        return (
          <button
            key={scaleKey}
            type="button"
            role="tab"
            aria-selected={isScaleActive}
            className={classNames(styles.scaleTab, {
              [styles.scaleTabActive]: isScaleActive,
            })}
            onClick={() => onChange(scaleKey)}
          >
            <i className={scale.icon} />
            <span>{scale.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const SkillScaleTabs = memo(SkillScaleTabsComponent);
export default SkillScaleTabs;
