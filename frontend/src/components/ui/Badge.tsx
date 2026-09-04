import type { BookStatus, BorrowingStatus } from '@/types';
import React from 'react';
import type { ReactNode } from 'react';

export type BadgeVariant = 'available' | 'borrowed' | 'active' | 'returned' | 'overdue' | 'neutral' | 'success' | 'danger';

interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant | BookStatus | BorrowingStatus;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = true,
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'available':
      case 'success':
        return {
          bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50',
          dotBg: 'bg-emerald-400',
          label: 'Disponible',
        };
      case 'borrowed':
        return {
          bg: 'bg-amber-950/40 text-amber-300 border-amber-800/50',
          dotBg: 'bg-amber-400',
          label: 'Emprunté',
        };
      case 'active':
        return {
          bg: 'bg-sky-950/40 text-sky-300 border-sky-800/50',
          dotBg: 'bg-sky-400',
          label: 'En cours',
        };
      case 'returned':
        return {
          bg: 'bg-neutral-800/50 text-neutral-300 border-neutral-700/60',
          dotBg: 'bg-neutral-400',
          label: 'Retourné',
        };
      case 'overdue':
      case 'danger':
        return {
          bg: 'bg-rose-950/40 text-rose-300 border-rose-800/50',
          dotBg: 'bg-rose-400 animate-pulse',
          label: 'En retard',
        };
      case 'neutral':
      default:
        return {
          bg: 'bg-neutral-900 text-neutral-300 border-neutral-800',
          dotBg: 'bg-neutral-400',
          label: '',
        };
    }
  };

  const style = getStyles();
  const content = children || style.label;

  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full select-none whitespace-nowrap ${style.bg} ${sizeClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotBg}`} />}
      <span>{content}</span>
    </span>
  );
};
