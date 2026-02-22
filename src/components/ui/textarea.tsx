'use client';

import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  /** Etiqueta. */
  label?: string;
  /** Mensaje de error. */
  error?: string;
  /** Estado success. */
  success?: boolean;
  /** Mostrar contador de caracteres (requiere maxLength en props). */
  showCount?: boolean;
  /** Clase del contenedor. */
  className?: string;
  /** Clase del textarea. */
  textareaClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      success = false,
      showCount = false,
      className,
      textareaClassName,
      id: idProp,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const id = idProp ?? `textarea-${Math.random().toString(36).slice(2, 9)}`;
    const length = typeof value === 'string' ? value.length : 0;

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <motion.div
          className={cn(
            'rounded-[var(--radius-input)] border bg-[var(--color-bg-input)] transition-colors focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-bg-primary)]',
            error
              ? 'border-[var(--color-error)] focus-within:ring-[var(--color-error)]'
              : success
                ? 'border-[var(--color-success)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
          )}
          animate={error ? { x: [0, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <TextareaAutosize
            ref={ref}
            id={id}
            value={value}
            maxLength={maxLength}
            className={cn(
              'w-full min-h-[80px] resize-none bg-transparent px-3 py-2.5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-input)] focus:outline-none',
              textareaClassName
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
        </motion.div>
        <div className="flex justify-between items-center mt-1">
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                id={`${id}-error`}
                role="alert"
                className="text-sm text-[var(--color-error)]"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          {showCount && typeof maxLength === 'number' && (
            <span
              className={cn(
                'text-xs tabular-nums',
                length > maxLength ? 'text-[var(--color-error)]' : 'text-[var(--color-text-tertiary)]'
              )}
              aria-live="polite"
            >
              {length}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
