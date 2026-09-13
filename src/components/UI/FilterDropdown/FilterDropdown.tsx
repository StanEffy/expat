import React, { useId } from 'react';
import { Dropdown, type DropdownProps } from 'primereact/dropdown';
import styles from './FilterDropdown.module.scss';

export interface FilterDropdownProps extends DropdownProps {
  label?: string;
  labelIcon?: string;
  containerClassName?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  labelIcon,
  id,
  className,
  containerClassName,
  ...dropdownProps
}) => {
  const generatedId = useId();
  const dropdownId = id || `filter-dropdown-${generatedId}`;

  return (
    <div className={`${styles.container} ${containerClassName || ''}`}>
      {label && (
        <label htmlFor={dropdownId} className={styles.label}>
          {labelIcon && <i className={labelIcon} aria-hidden="true" />}
          <span>{label}</span>
        </label>
      )}
      <Dropdown
        id={dropdownId}
        className={`${styles.dropdown} ${className || ''}`}
        {...dropdownProps}
      />
    </div>
  );
};
