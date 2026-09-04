import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, leftIcon, className = '', children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-zinc-300">
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-zinc-500">
              {leftIcon}
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none bg-[#16161a] border text-zinc-100 text-sm rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-zinc-950 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-9' : 'pl-3'
            } pr-9 py-2 cursor-pointer ${
              error ? 'border-red-500/80 focus:ring-red-500' : 'border-zinc-800'
            } ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 flex items-center pointer-events-none text-zinc-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-xs text-red-400 leading-none">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-zinc-500 leading-none">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

