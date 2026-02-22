'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-surface-active)] text-[var(--color-text-primary)] border border-[var(--color-border)]',
        success:
          'bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-[var(--color-success)]/20',
        warning:
          'bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border border-[var(--color-warning)]/20',
        error:
          'bg-[var(--color-error-subtle)] text-[var(--color-error)] border border-[var(--color-error)]/20',
        info:
          'bg-[var(--color-info-subtle)] text-[var(--color-info)] border border-[var(--color-info)]/20',
        outline:
          'bg-transparent border border-[var(--color-border-strong)] text-[var(--color-text-secondary)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Muestra un punto pulsante (para estados live). */
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, dot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      >
        {dot && (
          <motion.span
            className="size-1.5 shrink-0 rounded-full bg-current"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
