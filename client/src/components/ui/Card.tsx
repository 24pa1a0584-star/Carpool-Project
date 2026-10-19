import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  hoverable = false,
  glass = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-3xl border border-brand-violet/10 transition-all duration-300',
          glass
            ? 'glass-panel shadow-sm'
            : 'bg-white shadow-[0_4px_20px_-4px_rgba(17,21,44,0.05)]',
          hoverable &&
            'hover:-translate-y-1 hover:shadow-card-hover hover:border-brand-violet/25 cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
