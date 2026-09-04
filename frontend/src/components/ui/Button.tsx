import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer';

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.25 gap-1.5 h-8',
      md: 'text-sm px-3.5 py-1.75 gap-2 h-9',
      lg: 'text-sm px-4 py-2.25 gap-2.5 h-10 font-semibold',
    };

    const variantStyles = {
      primary:
        'bg-neutral-100 text-neutral-950 hover:bg-white active:bg-neutral-200 shadow-sm shadow-black/20 font-semibold',
      secondary:
        'bg-neutral-800/80 text-neutral-200 hover:bg-neutral-800 hover:text-white border border-neutral-700/60 active:bg-neutral-700/80',
      outline:
        'bg-transparent text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/50 border border-neutral-800 active:bg-neutral-800',
      ghost:
        'bg-transparent text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 active:bg-neutral-800',
      danger:
        'bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 hover:text-rose-200 active:bg-rose-900',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
