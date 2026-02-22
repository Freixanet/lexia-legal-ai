'use client';

import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** Etiqueta visible (arriba o flotante). */
  label?: string;
  /** Label flotante (placeholder que sube al enfocar/relleno). */
  floatingLabel?: boolean;
  /** Icono a la izquierda. */
  leftIcon?: ReactNode;
  /** Botón a la derecha (ej. ojo para contraseña). */
  rightAction?: ReactNode;
  /** Tipo password con toggle mostrar/ocultar. */
  showPasswordToggle?: boolean;
  /** Mensaje de error (muestra estado error + shake). */
  error?: string;
  /** Estado success (checkmark verde). */
  success?: boolean;
  /** Clase del contenedor. */
  className?: string;
  /** Clase del input. */
  inputClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      floatingLabel,
      leftIcon,
      rightAction,
      showPasswordToggle = false,
      error,
      success = false,
      className,
      inputClassName,
      id: idProp,
      type: typeProp = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.defaultValue || !!props.value);
    const id = idProp ?? `input-${Math.random().toString(36).slice(2, 9)}`;
    const type = showPasswordToggle ? (showPassword ? 'text' : 'password') : typeProp;
    const isFloating = floatingLabel && (focused || hasValue);

    const right = rightAction ?? (showPasswordToggle ? (
      <button
        type="button"
        onClick={() => setShowPassword((p) => !p)}
        className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] rounded-[var(--radius-sm)] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    ) : null);

    return (
      <div className={cn('w-full', className)}>
        {label && !floatingLabel && (
          <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
            {label}
          </label>
        )}
        <motion.div
          className={cn(
            'flex items-center gap-2 rounded-[var(--radius-input)] border bg-[var(--color-bg-input)] transition-colors',
            'focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-bg-primary)]',
            error
              ? 'border-[var(--color-error)] focus-within:ring-[var(--color-error)]'
              : success
                ? 'border-[var(--color-success)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
          )}
          animate={error ? { x: [0, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {leftIcon && (
            <span className="pl-3 text-[var(--color-text-tertiary)] shrink-0" aria-hidden>
              {leftIcon}
            </span>
          )}
          <div className="relative flex-1 min-w-0">
            {label && floatingLabel && (
              <label
                htmlFor={id}
                className={cn(
                  'absolute left-3 transition-all duration-200 pointer-events-none text-[var(--color-text-tertiary)]',
                  isFloating
                    ? 'top-1.5 text-xs text-[var(--color-accent)]'
                    : 'top-1/2 -translate-y-1/2 text-sm'
                )}
              >
                {label}
              </label>
            )}
            <input
              ref={ref}
              id={id}
              type={type}
              className={cn(
                'w-full h-11 bg-transparent px-3 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed',
                floatingLabel && label && (isFloating ? 'pt-5' : ''),
                leftIcon && 'pl-0',
                (right || success) && 'pr-0',
                inputClassName
              )}
              placeholder={floatingLabel && label ? '' : props.placeholder}
              onFocus={(e) => {
                setFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                setHasValue(!!e.target.value);
                props.onBlur?.(e);
              }}
              onChange={(e) => {
                setHasValue(!!e.target.value);
                props.onChange?.(e);
              }}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : success ? `${id}-success` : undefined}
              {...props}
            />
            {success && (
              <span
                id={`${id}-success`}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-success)]"
                aria-hidden
              >
                <Check className="size-4" />
              </span>
            )}
          </div>
          {right && !success && <span className="pr-2 shrink-0">{right}</span>}
        </motion.div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${id}-error`}
              role="alert"
              className="mt-1.5 text-sm text-[var(--color-error)]"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
