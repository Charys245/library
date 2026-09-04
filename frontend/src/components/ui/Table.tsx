import React from 'react';
import type  { TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode } from 'react';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-800 bg-[#111114]">
      <table className={`w-full text-left border-collapse text-sm text-zinc-300 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <thead className={`border-b border-zinc-800 bg-[#16161a] text-xs font-semibold text-zinc-400 uppercase tracking-wider ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <tbody className={`divide-y divide-zinc-800/60 ${className}`}>{children}</tbody>;
};

export const TableRow: React.FC<{
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
}> = ({ children, className = '', onClick, clickable = false }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-150 ${
        clickable || onClick
          ? 'cursor-pointer hover:bg-zinc-800/50 active:bg-zinc-800/70'
          : 'hover:bg-zinc-800/30'
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHead: React.FC<ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <th className={`px-4 py-3.5 text-left font-medium text-zinc-400 ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={`px-4 py-3.5 align-middle ${className}`} {...props}>
      {children}
    </td>
  );
};

