'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const cardVariants = cva(
  'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors',
  {
    variants: {
      variant: {
        default: 'shadow-[var(--shadow-sm)]',
        interactive:
          'shadow-[var(--shadow-sm)] cursor-pointer hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-glow)]',
        glass:
          'bg-[var(--color-glass-bg)] border-[var(--color-glass-border)] backdrop-blur-xl shadow-[var(--shadow-glass)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof cardVariants> {
  /** Contenido del header. */
  header?: ReactNode;
  /** Contenido del body (si no usas children). */
  body?: ReactNode;
  /** Contenido del footer. */
  footer?: ReactNode;
  children?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, header, body, footer, children, ...props }, ref) => {
    const content = children ?? body;
    return (
      <motion.div
        ref={ref}
        className={cn(cardVariants({ variant }), className)}
        whileHover={variant === 'interactive' ? { y: -2 } : undefined}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        {...props}
      >
        {header != null && (
          <div className="px-5 pt-5 pb-2 border-b border-[var(--color-border)]">
            {header}
          </div>
        )}
        {(content != null || (header == null && footer == null)) && (
          <div className={cn('px-5 py-4', header && 'pt-4', footer && 'pb-4')}>
            {content}
          </div>
        )}
        {footer != null && (
          <div className="px-5 py-4 pt-2 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]/50 rounded-b-[var(--radius-card)]">
            {footer}
          </div>
        )}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export { Card, cardVariants };
