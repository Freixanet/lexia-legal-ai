import React, { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, actionLabel, onAction, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast-container" role="alert">
      <span>{message}</span>
      {actionLabel && (
        <button className="toast-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default Toast;
