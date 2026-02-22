'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const skeletonVariants = cva(
  'rounded-[var(--radius-sm)]',
  {
    variants: {
      variant: {
        text: 'h-4 w-full',
        circle: 'rounded-[var(--radius-full)]',
        card: 'h-24 w-full rounded-[var(--radius-card)]',
        'chat-message': 'h-16 w-3/4 rounded-[var(--radius-md)]',
      },
    },
    defaultVariants: { variant: 'text' },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      style={{
        background:
          'linear-gradient(90deg, var(--color-surface-active) 25%, var(--color-surface-hover) 50%, var(--color-surface-active) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
      aria-hidden
      {...props}
    />
  );
}

/** Skeleton para la landing (hero + búsqueda + cards). Usa Skeleton.css. */
function SkeletonLanding() {
  return (
    <div className="skeleton-landing">
      <div className="skeleton-landing-hero">
        <div className="skeleton h-10 w-48 rounded-[var(--radius-md)]" />
        <div className="skeleton h-6 w-72 max-w-full rounded-[var(--radius-sm)]" />
      </div>
      <div className="skeleton-landing-search w-full">
        <div className="skeleton h-12 w-full rounded-[var(--radius-input)]" />
      </div>
      <div className="skeleton-landing-cards">
        <div className="skeleton h-24 flex-1 rounded-[var(--radius-card)]" />
        <div className="skeleton h-24 flex-1 rounded-[var(--radius-card)]" />
        <div className="skeleton h-24 flex-1 rounded-[var(--radius-card)]" />
      </div>
    </div>
  );
}

/** Skeleton para la vista de chat (header + mensajes + input). */
function SkeletonChat() {
  return (
    <div className="skeleton-chat">
      <div className="skeleton-chat-header">
        <div className="skeleton h-6 w-32 rounded-[var(--radius-sm)]" />
      </div>
      <div className="skeleton-chat-messages">
        <div className="skeleton-message skeleton-message-user">
          <div className="skeleton-message-lines">
            <div className="skeleton h-4 w-full rounded-[var(--radius-sm)]" />
            <div className="skeleton h-4 w-4/5 rounded-[var(--radius-sm)]" />
          </div>
        </div>
        <div className="skeleton-message skeleton-message-assistant">
          <div className="skeleton size-8 shrink-0 rounded-[var(--radius-full)]" />
          <div className="skeleton-message-lines">
            <div className="skeleton h-4 w-full rounded-[var(--radius-sm)]" />
            <div className="skeleton h-4 w-full rounded-[var(--radius-sm)]" />
            <div className="skeleton h-4 w-3/4 rounded-[var(--radius-sm)]" />
          </div>
        </div>
      </div>
      <div className="skeleton-chat-input">
        <div className="skeleton h-14 w-full rounded-[var(--radius-input)]" />
      </div>
    </div>
  );
}

/** Skeleton para página legal (aviso legal, privacidad, cookies). */
function SkeletonLegal() {
  return (
    <div className="skeleton-legal">
      <div className="skeleton-legal-header">
        <div className="skeleton h-8 w-48 rounded-[var(--radius-sm)]" />
        <div className="skeleton h-4 w-full max-w-md rounded-[var(--radius-sm)]" />
      </div>
      <div className="skeleton-legal-body">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton-legal-block">
            <div className="skeleton h-5 w-32 rounded-[var(--radius-sm)]" />
            <div className="skeleton h-4 w-full rounded-[var(--radius-sm)]" />
            <div className="skeleton h-4 w-full rounded-[var(--radius-sm)]" />
            <div className="skeleton h-4 w-4/5 rounded-[var(--radius-sm)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton para página de login. */
function SkeletonLogin() {
  return (
    <div className="skeleton-login">
      <div className="skeleton-login-card">
        <div className="skeleton skeleton-login-title" />
        <div className="skeleton skeleton-login-field" />
        <div className="skeleton skeleton-login-field" />
        <div className="skeleton skeleton-login-btn" />
      </div>
    </div>
  );
}

export { Skeleton, skeletonVariants, SkeletonLanding, SkeletonChat, SkeletonLegal, SkeletonLogin };
