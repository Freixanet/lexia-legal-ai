'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SHORTCUTS_CHEATSHEET } from '../../hooks/useKeyboardShortcuts';
import Icon from '../ui/Icon';
import './KeyboardShortcutsCheatsheet.css';

interface KeyboardShortcutsCheatsheetProps {
  open: boolean;
  onClose: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

function formatKey(k: string): string {
  if (k === '⌘') return isMac ? '⌘' : 'Ctrl';
  if (k === '⇧') return 'Shift';
  return k;
}

export function KeyboardShortcutsCheatsheet({ open, onClose }: KeyboardShortcutsCheatsheetProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="shortcuts-cheatsheet-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="Atajos de teclado"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="shortcuts-cheatsheet-modal"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shortcuts-cheatsheet-header">
            <h2 className="shortcuts-cheatsheet-title">Atajos de teclado</h2>
            <button
              type="button"
              className="shortcuts-cheatsheet-close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <ul className="shortcuts-cheatsheet-list">
            {SHORTCUTS_CHEATSHEET.map((row, i) => (
              <li key={i} className="shortcuts-cheatsheet-row">
                <span className="shortcuts-cheatsheet-label">{row.label}</span>
                <span className="shortcuts-cheatsheet-keys">
                  {row.keys.map((key, j) => (
                    <kbd key={j}>{formatKey(key)}</kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
