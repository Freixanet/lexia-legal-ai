'use client';

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutsConfig {
  onNewChat?: () => void;
  onOpenCommandPalette?: () => void;
  onFocusChatInput?: () => void;
  onCloseModalOrStop?: () => void;
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
  onOpenCheatsheet?: () => void;
  /** When true, Cmd+K and similar are disabled (e.g. when typing in an input). */
  disableGlobal?: boolean;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? 'metaKey' : 'ctrlKey';

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const {
    onNewChat,
    onOpenCommandPalette,
    onFocusChatInput,
    onCloseModalOrStop,
    onToggleSidebar,
    onToggleTheme,
    onOpenCheatsheet,
    disableGlobal = false,
  } = config;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disableGlobal) return;
      const target = e.target as HTMLElement;
      const isInput = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable;
      const cmd = e.metaKey || e.ctrlKey;

      if (e.key === 'k' && cmd) {
        e.preventDefault();
        onOpenCommandPalette?.();
        return;
      }
      if (e.key === '?' && cmd) {
        e.preventDefault();
        onOpenCheatsheet?.();
        return;
      }
      if (e.key === 'n' && cmd && !e.shiftKey) {
        e.preventDefault();
        onNewChat?.();
        return;
      }
      if (e.key === '/' && cmd) {
        e.preventDefault();
        onFocusChatInput?.();
        return;
      }
      if (e.key === 's' && cmd && e.shiftKey) {
        e.preventDefault();
        onToggleSidebar?.();
        return;
      }
      if (e.key === 'd' && cmd) {
        e.preventDefault();
        onToggleTheme?.();
        return;
      }
      if (e.key === 'Escape') {
        onCloseModalOrStop?.();
        return;
      }
    },
    [
      onNewChat,
      onOpenCommandPalette,
      onFocusChatInput,
      onCloseModalOrStop,
      onToggleSidebar,
      onToggleTheme,
      onOpenCheatsheet,
      disableGlobal,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const SHORTCUTS_CHEATSHEET = [
  { keys: ['⌘', 'K'], label: 'Paleta de comandos' },
  { keys: ['⌘', 'N'], label: 'Nueva conversación' },
  { keys: ['⌘', '/'], label: 'Enfocar input del chat' },
  { keys: ['⌘', '⇧', 'S'], label: 'Abrir/cerrar historial' },
  { keys: ['⌘', 'D'], label: 'Cambiar tema (claro/oscuro)' },
  { keys: ['⌘', '?'], label: 'Ver atajos de teclado' },
  { keys: ['Esc'], label: 'Cerrar modal / cancelar generación' },
] as const;
