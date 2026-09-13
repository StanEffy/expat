import React from 'react';
import { Button, type ButtonProps } from 'primereact/button';
import styles from './PrimaryActionButton.module.scss';

export interface PrimaryActionButtonProps extends ButtonProps {
  label: string;
  icon?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  label,
  icon,
  onClick,
  className,
  ...buttonProps
}) => {
  return (
    <Button
      type="button"
      label={label}
      icon={icon}
      onClick={onClick}
      className={`${styles.primaryBtn} ${className || ''}`}
      {...buttonProps}
    />
  );
};
