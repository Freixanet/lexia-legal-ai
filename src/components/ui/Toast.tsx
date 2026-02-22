'use client';

import './Toast.css';
import { Toaster as SonnerToaster } from 'sonner';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import type { ToasterProps } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const toastIcons = {
  success: <CheckCircle className="size-4 text-[var(--color-success)]" />,
  error: <XCircle className="size-4 text-[var(--color-error)]" />,
  info: <Info className="size-4 text-[var(--color-info)]" />,
  warning: <AlertTriangle className="size-4 text-[var(--color-warning)]" />,
};

function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          color: 'var(--color-text-primary)',
        },
        success: { icon: toastIcons.success },
        error: { icon: toastIcons.error },
        info: { icon: toastIcons.info },
        warning: { icon: toastIcons.warning },
      }}
      {...props}
    />
  );
}

const TOAST_DURATION_MS = 4000;
const easeOut = [0.22, 1, 0.36, 1] as const;

export interface ToastInlineProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}

function ToastInline({ message, actionLabel, onAction, onClose }: ToastInlineProps) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION_MS) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onClose();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          role="status"
          className="toast-inline"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.25, ease: easeOut }}
        >
          <div className="toast-inline-content">
            <span className="toast-inline-message">{message}</span>
            {actionLabel && onAction && (
              <button
                type="button"
                onClick={() => { onAction(); handleClose(); }}
                className="toast-inline-action"
              >
                {actionLabel}
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="toast-inline-close"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <div
            className="toast-inline-progress"
            style={{ transform: `scaleX(${progress / 100})` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Toaster, toast } from 'sonner';
export default ToastInline;
