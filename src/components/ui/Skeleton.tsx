import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-md)',
  className = '',
}) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius }}
    aria-hidden="true"
  />
);

const SkeletonChat: React.FC = () => (
  <div className="skeleton-chat" aria-label="Cargando interfaz">
    <div className="skeleton-chat-header">
      <Skeleton width="200px" height="20px" />
    </div>
    <div className="skeleton-chat-messages">
      <div className="skeleton-message skeleton-message-user">
        <Skeleton width="60%" height="44px" borderRadius="var(--radius-xl)" />
      </div>
      <div className="skeleton-message skeleton-message-assistant">
        <Skeleton width="32px" height="32px" borderRadius="var(--radius-full)" />
        <div className="skeleton-message-lines">
          <Skeleton width="90%" height="14px" />
          <Skeleton width="75%" height="14px" />
          <Skeleton width="85%" height="14px" />
          <Skeleton width="40%" height="14px" />
        </div>
      </div>
    </div>
    <div className="skeleton-chat-input">
      <Skeleton width="100%" height="52px" borderRadius="var(--radius-input)" />
    </div>
  </div>
);

const SkeletonLanding: React.FC = () => (
  <div className="skeleton-landing" aria-label="Cargando">
    <div className="skeleton-landing-hero">
      <Skeleton width="320px" height="48px" borderRadius="var(--radius-md)" />
      <Skeleton width="220px" height="48px" borderRadius="var(--radius-md)" />
      <Skeleton width="400px" height="18px" borderRadius="var(--radius-sm)" />
    </div>
    <Skeleton width="100%" height="56px" borderRadius="var(--radius-input)" className="skeleton-landing-search" />
    <div className="skeleton-landing-cards">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} width="100%" height="72px" borderRadius="var(--radius-card)" />
      ))}
    </div>
  </div>
);

export { Skeleton, SkeletonChat, SkeletonLanding };
export default Skeleton;
