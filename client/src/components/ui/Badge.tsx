import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'violet' | 'orange' | 'lime' | 'turquoise' | 'pink' | 'neutral' | 'red';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'violet',
  size = 'sm',
  children,
  className,
}) => {
  const variantStyles = {
    violet: 'bg-brand-violet/10 text-brand-violet border border-brand-violet/20',
    orange: 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20',
    lime: 'bg-brand-lime/25 text-[#5B7808] border border-brand-lime/40 font-semibold',
    turquoise: 'bg-brand-turquoise/15 text-[#0F766E] border border-brand-turquoise/30',
    pink: 'bg-brand-pink/15 text-[#BE185D] border border-brand-pink/30',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
    red: 'bg-rose-100 text-rose-700 border border-rose-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-xs px-3 py-1 rounded-full font-medium',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 whitespace-nowrap select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
    >
      {children}
    </span>
  );
};
