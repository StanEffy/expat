import React, { forwardRef, useId } from 'react';
import { InputText, type InputTextProps } from 'primereact/inputtext';
import styles from './SearchInput.module.scss';

export interface SearchInputProps extends Omit<InputTextProps, 'onChange' | 'value'> {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  label?: string;
  labelIcon?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  value,
  onChange,
  onValueChange,
  onClear,
  label,
  labelIcon = 'pi pi-search',
  placeholder,
  id,
  className,
  inputClassName,
  ariaLabel,
  disabled = false,
  ...rest
}, ref) => {
  const generatedId = useId();
  const inputId = id || `search-input-${generatedId}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onValueChange) {
      onValueChange('');
    } else if (onChange) {
      // Synthesize event if only onChange is provided
      const syntheticEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {labelIcon && <i className={labelIcon} />}
          <span>{label}</span>
        </label>
      )}
      <div className={styles.wrapper}>
        <i className={`pi pi-search ${styles.searchIcon}`} aria-hidden="true" />
        <InputText
          ref={ref}
          id={inputId}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={ariaLabel || label || placeholder || 'Search'}
          disabled={disabled}
          className={`${styles.input} ${inputClassName || ''}`}
          {...rest}
        />
        {value && !disabled && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <i className="pi pi-times" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
});

SearchInput.displayName = 'SearchInput';
