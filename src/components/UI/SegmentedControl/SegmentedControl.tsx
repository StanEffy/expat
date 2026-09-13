import React from 'react';
import styles from './SegmentedControl.module.scss';

export interface SegmentedItem<T extends string | number = string> {
  id: T;
  label: string;
  icon?: string;
  count?: number | string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string | number = string> {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  itemClassName?: string;
  fullWidth?: boolean;
  mobileLayout?: 'stack' | 'scroll' | 'grid';
  ariaLabel?: string;
}

export function SegmentedControl<T extends string | number = string>({
  items,
  value,
  onChange,
  className,
  itemClassName,
  fullWidth = false,
  mobileLayout = 'stack',
  ariaLabel = 'Segmented options',
}: SegmentedControlProps<T>): React.ReactElement {
  const layoutClass =
    mobileLayout === 'scroll'
      ? styles.layoutScroll
      : mobileLayout === 'grid'
      ? styles.layoutGrid
      : styles.layoutStack;

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`${styles.container} ${layoutClass} ${fullWidth ? styles.fullWidth : ''} ${className || ''}`}
    >
      {items.map((item) => {
        const isActive = value === item.id;
        return (
          <button
            key={String(item.id)}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            className={`${styles.item} ${isActive ? styles.active : ''} ${itemClassName || ''}`}
            onClick={() => !item.disabled && onChange(item.id)}
          >
            <span className={styles.itemContent}>
              {item.icon && <i className={item.icon} aria-hidden="true" />}
              <span>{item.label}</span>
            </span>
            {item.count !== undefined && (
              <span className={styles.badge}>{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
