'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../ui/Icon';
import './CommandPalette.css';

export type CommandAction =
  | { type: 'navigate'; path: string; label: string; description?: string; icon: 'message-circle' | 'home' | 'document' | 'settings' }
  | { type: 'action'; id: string; label: string; description?: string; icon: 'plus' | 'attach' | 'sun' | 'moon' | 'menu'; handler: () => void }
  | { type: 'conversation'; id: string; title: string; description?: string };

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  /** Quick actions + search results (conversations, etc.) */
  items: CommandAction[];
  onSelectConversation?: (id: string) => void;
  onNewChat?: () => void;
  onUploadDocument?: () => void;
  onToggleTheme?: () => void;
  onToggleSidebar?: () => void;
  theme?: 'light' | 'dark';
  /** Filter items by query; if not provided, items are filtered internally by label/title. */
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const DEFAULT_QUICK_ACTIONS: CommandAction[] = [
  { type: 'action', id: 'new-chat', label: 'Nueva conversación', description: 'Abrir un nuevo chat', icon: 'plus', handler: () => {} },
  { type: 'action', id: 'upload', label: 'Subir documento', description: 'Adjuntar PDF o imagen', icon: 'attach', handler: () => {} },
  { type: 'action', id: 'toggle-theme', label: 'Cambiar tema', description: 'Alternar claro / oscuro', icon: 'sun', handler: () => {} },
  { type: 'action', id: 'toggle-sidebar', label: 'Abrir/cerrar historial', description: 'Mostrar u ocultar sidebar', icon: 'menu', handler: () => {} },
];

function getItemLabel(item: CommandAction): string {
  switch (item.type) {
    case 'navigate':
      return item.label;
    case 'action':
      return item.label;
    case 'conversation':
      return item.title;
    default:
      return '';
  }
}

function getItemDescription(item: CommandAction): string | undefined {
  switch (item.type) {
    case 'navigate':
      return item.description;
    case 'action':
      return item.description;
    case 'conversation':
      return item.description;
    default:
      return undefined;
  }
}

function CommandIcon({ item }: { item: CommandAction }) {
  if (item.type === 'conversation') {
    return <Icon name="message-circle" size={18} className="command-palette-item-icon" />;
  }
  if (item.type === 'navigate') {
    return <Icon name={item.icon} size={18} className="command-palette-item-icon" />;
  }
  return <Icon name={item.icon} size={18} className="command-palette-item-icon" />;
}

export function CommandPalette({
  open,
  onClose,
  items,
  onSelectConversation,
  onNewChat,
  onUploadDocument,
  onToggleTheme,
  onToggleSidebar,
  theme = 'dark',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const quickActions: CommandAction[] = useMemo(() => [
    { type: 'action', id: 'new-chat', label: 'Nueva conversación', description: 'Abrir un nuevo chat', icon: 'plus', handler: () => { onNewChat?.(); onClose(); } },
    { type: 'action', id: 'upload', label: 'Subir documento', description: 'Adjuntar PDF o imagen', icon: 'attach', handler: () => { onUploadDocument?.(); onClose(); } },
    { type: 'action', id: 'toggle-theme', label: theme === 'dark' ? 'Modo claro' : 'Modo oscuro', description: 'Cambiar tema', icon: theme === 'dark' ? 'sun' : 'moon', handler: () => { onToggleTheme?.(); onClose(); } },
    { type: 'action', id: 'toggle-sidebar', label: 'Abrir/cerrar historial', description: 'Mostrar u ocultar sidebar', icon: 'menu', handler: () => { onToggleSidebar?.(); onClose(); } },
  ], [onNewChat, onUploadDocument, onToggleTheme, onToggleSidebar, theme, onClose]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromConversations = items.filter((i): i is CommandAction => i.type === 'conversation') as Extract<CommandAction, { type: 'conversation' }>[];
    const matchedConvs = q
      ? fromConversations.filter((c) => c.title.toLowerCase().includes(q))
      : fromConversations.slice(0, 5);
    const actions = q
      ? quickActions.filter((a) => a.label.toLowerCase().includes(q) || (a.description?.toLowerCase().includes(q)))
      : quickActions;
    const result: CommandAction[] = [...actions, ...matchedConvs];
    return result.slice(0, 12);
  }, [query, items, quickActions]);

  const selectItem = useCallback(
    (item: CommandAction) => {
      if (item.type === 'action') {
        item.handler();
        return;
      }
      if (item.type === 'conversation') {
        onSelectConversation?.(item.id);
        onClose();
        return;
      }
      if (item.type === 'navigate') {
        window.location.href = item.path;
        onClose();
      }
    },
    [onSelectConversation, onClose]
  );

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setSelectedIndex(0);
  }, [open]);

  useEffect(() => {
    setSelectedIndex((i) => (i >= filteredItems.length ? Math.max(0, filteredItems.length - 1) : i));
  }, [filteredItems.length]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredItems.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
        return;
      }
      if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        selectItem(filteredItems[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, filteredItems, selectedIndex, selectItem]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="command-palette-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="Paleta de comandos"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="command-palette-modal"
          initial={{ opacity: 0, scale: 0.96, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -4 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="command-palette-search">
            <Icon name="search" size={18} className="command-palette-search-icon" aria-hidden />
            <input
              type="search"
              className="command-palette-input"
              placeholder="Buscar chats, documentos, acciones..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              aria-label="Buscar"
              autoComplete="off"
            />
          </div>
          <div className="command-palette-list" role="listbox">
            {filteredItems.length === 0 ? (
              <div className="command-palette-empty" role="status">
                Sin resultados
              </div>
            ) : (
              filteredItems.map((item, i) => (
                <button
                  key={item.type === 'conversation' ? item.id : item.type === 'action' ? item.id : item.path}
                  type="button"
                  role="option"
                  aria-selected={i === selectedIndex}
                  className={`command-palette-item ${i === selectedIndex ? 'selected' : ''}`}
                  onClick={() => selectItem(item)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <CommandIcon item={item} />
                  <div className="command-palette-item-text">
                    <span className="command-palette-item-label">{getItemLabel(item)}</span>
                    {getItemDescription(item) && (
                      <span className="command-palette-item-desc">{getItemDescription(item)}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="command-palette-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
            <span><kbd>Enter</kbd> seleccionar</span>
            <span><kbd>Esc</kbd> cerrar</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
