'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

const avatarSizes = cva('shrink-0 rounded-[var(--radius-full)]', {
  variants: {
    size: {
      sm: 'size-8 text-xs',
      md: 'size-10 text-sm',
      lg: 'size-12 text-base',
      xl: 'size-16 text-lg',
    },
  },
  defaultVariants: { size: 'md' },
});

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export interface AvatarProps
  extends Omit<React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>, 'children'>,
    VariantProps<typeof avatarSizes> {
  /** URL de la imagen. */
  src?: string | null;
  /** Nombre para fallback de iniciales. */
  name?: string;
  /** Estado online (punto verde). */
  online?: boolean;
  /** Estado offline (punto gris). */
  offline?: boolean;
}

const Avatar = forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, src, name, online, offline, ...rest }, ref) => {
  const showStatus = online === true || offline === true;
  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarSizes({ size }), 'relative flex overflow-hidden bg-[var(--color-surface-active)]', className)}
        {...rest}
      >
        <AvatarPrimitive.Image
          src={src ?? undefined}
          alt={name ? `Avatar de ${name}` : ''}
          className="aspect-square size-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className="flex size-full items-center justify-center font-medium text-[var(--color-text-secondary)] bg-[var(--color-accent-subtle)]"
          delayMs={0}
        >
          {name ? getInitials(name) : '?'}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[var(--color-bg-primary)]',
            online ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-tertiary)]'
          )}
          aria-hidden
        />
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export { Avatar, avatarSizes };
