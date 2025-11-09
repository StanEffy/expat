import React from 'react';
import { Button as PrimeButton } from 'primereact/button';
import type { ButtonProps as PrimeButtonProps } from 'primereact/button';
import styles from './Button.module.scss';

export interface ButtonProps extends Omit<PrimeButtonProps, 'className' | 'size'> {
  /**
   * Button style variant: 'filled' | 'outlined' | 'text'
   * Maps to PrimeReact's text/outlined props
   */
  variant?: 'filled' | 'outlined' | 'text';
  
  /**
   * Button size: 'small' | 'medium' | 'large'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Children (alternative to label)
   */
  children?: React.ReactNode;
}

/**
 * Universal Button component that wraps PrimeReact Button
 * Provides consistent styling and API across the application
 */
const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'medium',
  className = '',
  children,
  text,
  outlined,
  ...props
}) => {
  // Determine variant from props (variant prop takes precedence over text/outlined)
  let finalVariant: 'filled' | 'outlined' | 'text' = variant || 'filled';
  if (!variant) {
    if (text) finalVariant = 'text';
    else if (outlined) finalVariant = 'outlined';
    else finalVariant = 'filled';
  }

  // Map size to PrimeReact's size prop (PrimeReact only supports 'small' | 'large', not 'medium')
  const primeSize: 'small' | 'large' | undefined = size === 'medium' ? undefined : size;

  // Build className with variant and size
  const classNames = [
    styles.button,
    styles[finalVariant],
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  // Map variant to PrimeReact props
  const primeProps: PrimeButtonProps = {
    ...props,
    className: classNames,
    size: primeSize,
  };

  // Map variant to PrimeReact's text/outlined props
  // If variant is explicitly set, use it; otherwise preserve original text/outlined props
  if (variant) {
    if (variant === 'text') {
      primeProps.text = true;
    } else if (variant === 'outlined') {
      primeProps.outlined = true;
    }
  } else {
    // Preserve original text/outlined props if variant wasn't set
    if (text) primeProps.text = true;
    if (outlined) primeProps.outlined = true;
  }

  // Use children if provided, otherwise use label
  if (children) {
    return <PrimeButton {...primeProps}>{children}</PrimeButton>;
  }

  return <PrimeButton {...primeProps} />;
};

export default Button;

