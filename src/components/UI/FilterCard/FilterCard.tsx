import React from 'react';
import styles from './FilterCard.module.scss';

export interface FilterCardProps {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const FilterCard: React.FC<FilterCardProps> = ({
  children,
  className,
  ariaLabel = 'Filters',
}) => {
  return (
    <section
      className={`${styles.filterCard} ${className || ''}`}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
};

export const FilterRow: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={`${styles.row} ${className || ''}`}>{children}</div>;
};

export const FilterActions: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={`${styles.actions} ${className || ''}`}>{children}</div>;
};
