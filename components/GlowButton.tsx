'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/lib/utils';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'glow-btn text-white font-semibold',
  secondary: 'bg-[var(--bg-elevated)] hover:bg-[var(--purple-deep)] text-[var(--text-primary)] border border-[var(--purple-soft)] border-opacity-30 transition-all duration-300 hover:shadow-(--glow-purple)',
  outline: 'bg-transparent border border-[var(--purple-bright)] text-[var(--purple-glow)] hover:bg-[var(--purple-bright)] hover:text-white transition-all duration-300',
  danger: 'bg-gradient-to-r from-[#EC4899] to-[#D946EF] text-white hover:shadow-[var(--glow-pink)] transition-all duration-300 hover:scale-[1.02]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-base rounded-xl',
};

export default function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: GlowButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={classNames(
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        'font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        className
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2 justify-center">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
