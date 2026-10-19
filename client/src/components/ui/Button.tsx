import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'orange' | 'lime' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2 shadow-sm',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold shadow-md',
  };

  const variantStyles = {
    primary:
      'bg-brand-violet text-white hover:bg-[#6035EE] focus:ring-brand-violet shadow-glow-violet/40 hover:shadow-glow-violet',
    orange:
      'bg-brand-orange text-white hover:bg-[#E85D36] focus:ring-brand-orange shadow-glow-orange/40 hover:shadow-glow-orange',
    lime:
      'bg-brand-lime text-brand-navy hover:bg-[#BBE448] focus:ring-brand-lime shadow-glow-lime/40 font-bold',
    secondary:
      'bg-brand-lavender text-brand-violet hover:bg-[#E5DCFF] focus:ring-brand-violet',
    outline:
      'border-2 border-brand-violet/30 text-brand-navy hover:bg-brand-violet/5 hover:border-brand-violet focus:ring-brand-violet',
    ghost:
      'text-brand-navy hover:bg-brand-lavender/60 focus:ring-brand-violet',
    danger:
      'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 shadow-sm',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      disabled={disabled || isLoading}
      className={twMerge(
        clsx(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && 'w-full',
          className
        )
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </motion.button>
  );
};
