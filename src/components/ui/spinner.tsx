'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

const spinnerVariants = cva('shrink-0 rounded-[var(--radius-full)]', {
  variants: {
    size: {
      sm: 'size-4 border-2',
      md: 'size-6 border-2',
      lg: 'size-8 border-[3px]',
    },
    color: {
      default: 'border-[var(--color-accent)] border-t-transparent',
      muted: 'border-[var(--color-text-tertiary)] border-t-transparent',
      success: 'border-[var(--color-success)] border-t-transparent',
      error: 'border-[var(--color-error)] border-t-transparent',
    },
  },
  defaultVariants: { size: 'md', color: 'default' },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

function Spinner({ className, size, color, ...props }: SpinnerProps) {
  return (
    <motion.div
      className={cn(spinnerVariants({ size, color }), className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      role="status"
      aria-label="Cargando"
      {...props}
    />
  );
}

export { Spinner, spinnerVariants };
