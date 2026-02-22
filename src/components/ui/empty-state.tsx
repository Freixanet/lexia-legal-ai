'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { FileQuestion } from 'lucide-react';

export interface EmptyStateProps {
  /** Icono o ilustración (por defecto FileQuestion). */
  icon?: ReactNode;
  /** Título. */
  title: string;
  /** Descripción opcional. */
  description?: string;
  /** CTA (botón o enlace). */
  action?: ReactNode;
  /** Clase del contenedor. */
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 px-6 text-center',
        className
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="flex size-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-active)] text-[var(--color-text-tertiary)]"
        aria-hidden
      >
        {icon ?? <FileQuestion className="size-7" />}
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
}

export { EmptyState };
