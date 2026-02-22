'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] rounded-[var(--radius-button)] select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-accent)] text-[var(--color-accent-text)] shadow-[var(--shadow-button)] hover:bg-[var(--color-accent-hover)] hover:brightness-105',
        secondary:
          'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-strong)]',
        ghost:
          'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]',
        destructive:
          'bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/90',
        outline:
          'border-2 border-[var(--color-accent)] text-[var(--color-accent)] bg-transparent hover:bg-[var(--color-accent-subtle)]',
        link:
          'text-[var(--color-accent)] underline-offset-4 hover:underline bg-transparent',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-[var(--radius-sm)]',
        md: 'h-10 px-4 text-sm rounded-[var(--radius-button)]',
        lg: 'h-12 px-6 text-base rounded-[var(--radius-md)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends Omit<ComponentPropsWithoutRef<typeof motion.button>, 'children'>,
    VariantProps<typeof buttonVariants> {
  /** Spinner cuando está cargando; si hay children, se muestra "Procesando..." mientras carga. */
  isLoading?: boolean;
  /** Icono a la izquierda. */
  leftIcon?: ReactNode;
  /** Icono a la derecha. */
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled ?? isLoading}
        whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        aria-busy={isLoading}
        aria-disabled={disabled ?? isLoading}
        {...props}
      >
        {isLoading ? (
          <span
            className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        ) : (
          leftIcon
        )}
        {children != null && (
          <span>{isLoading ? 'Procesando...' : children}</span>
        )}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
