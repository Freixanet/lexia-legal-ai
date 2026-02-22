'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils/cn';

const Separator = forwardRef<
  ElementRef<typeof SeparatorPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    /** Label opcional en el centro (ej. "o", "—"). */
    label?: ReactNode;
  }
>(({ className, orientation = 'horizontal', decorative = true, label, ...props }, ref) => {
  if (label != null) {
    return (
      <div
        className={cn(
          'flex items-center gap-3',
          orientation === 'horizontal' ? 'w-full' : 'h-full flex-col',
          className
        )}
        role="separator"
        aria-orientation={orientation}
      >
        <SeparatorPrimitive.Root
          ref={ref}
          decorative
          orientation={orientation}
          className={cn(
            'shrink-0 bg-[var(--color-border)]',
            orientation === 'horizontal' ? 'h-px flex-1' : 'w-px flex-1',
            !label && className
          )}
          {...props}
        />
        <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">
          {label}
        </span>
        <SeparatorPrimitive.Root
          decorative
          orientation={orientation}
          className={cn(
            'shrink-0 bg-[var(--color-border)]',
            orientation === 'horizontal' ? 'h-px flex-1' : 'w-px flex-1'
          )}
        />
      </div>
    );
  }
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-[var(--color-border)]',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
      {...props}
    />
  );
});
Separator.displayName = 'Separator';

export { Separator };
