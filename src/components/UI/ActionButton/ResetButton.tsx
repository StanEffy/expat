import React from 'react';
import { Button } from 'primereact/button';
import styles from './ResetButton.module.scss';

export interface ResetButtonProps {
  onClick: () => void;
  tooltip?: string;
  className?: string;
  disabled?: boolean;
}

export const ResetButton: React.FC<ResetButtonProps> = ({
  onClick,
  tooltip = 'Reset',
  className,
  disabled = false,
}) => {
  return (
    <Button
      type="button"
      icon="pi pi-refresh"
      onClick={onClick}
      tooltip={tooltip}
      tooltipOptions={{ position: 'top' }}
      aria-label={tooltip}
      disabled={disabled}
      className={`${styles.resetBtn} ${className || ''}`}
    />
  );
};
