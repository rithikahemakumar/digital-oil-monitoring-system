import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 ${className} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
    >
      {children}
    </div>
  );
}
