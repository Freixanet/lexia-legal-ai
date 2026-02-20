import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { Conversation } from '../services/api';
import Icon from './ui/Icon';
import { LexiaLogo } from './ui/Icon';
import Modal from './ui/Modal';
import Toast from './ui/Toast';
import './Sidebar.css';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onGoHome: () => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRestoreConversation: (conversation: Conversation) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onGoHome,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRestoreConversation,
  onRenameConversation,
  onClearAll,
  isOpen,
  onClose,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteHistoryModalOpen, setDeleteHistoryModalOpen] = useState(false);
  const [targetConversation, setTargetConversation] = useState<Conversation | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [toast, setToast] = useState<{ message: string; actionLabel?: string; onAction?: () => void } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.messages.some(m => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  const grouped = filteredConversations.reduce<Record<string, Conversation[]>>((acc, conv) => {
    const label = formatDate(conv.updatedAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(conv);
    return acc;
  }, {});

  const getLastMessage = (conv: Conversation): string => {
    const lastMsg = conv.messages[conv.messages.length - 1];
    if (!lastMsg) return 'Sin mensajes';
    const text = lastMsg.content.replace(/---SOURCES---[\s\S]*/, '').trim();
    return text.slice(0, 60) + (text.length > 60 ? '...' : '');
  };

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === id ? null : id);
  };

  const handleRenameClick = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setTargetConversation(conv);
    setNewTitle(conv.title);
    setRenameModalOpen(true);
    setMenuOpenId(null);
  };

  const handleRenameSubmit = () => {
    if (targetConversation && newTitle.trim()) {
      onRenameConversation(targetConversation.id, newTitle.trim());
      setRenameModalOpen(false);
      setTargetConversation(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setMenuOpenId(null);
    onDeleteConversation(conv.id);

    setToast({
      message: 'Conversación eliminada',
      actionLabel: 'DESHACER',
      onAction: () => {
        onRestoreConversation(conv);
        setToast(null);
      }
    });
  };

  const handleClearHistoryClick = () => {
    setDeleteHistoryModalOpen(true);
    setDeleteConfirmText('');
  };

  const handleClearHistoryConfirm = () => {
    if (deleteConfirmText === 'BORRAR') {
      onClearAll();
      setDeleteHistoryModalOpen(false);
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${isOpen ? 'open' : ''}`}
        id="sidebar"
        role="complementary"
        aria-label="Historial de conversaciones"
      >
        <div className="sidebar-header">
          <button
            className="sidebar-logo"
            onClick={() => {
              onGoHome();
              onClose();
            }}
            aria-label="Volver al inicio"
          >
            <div className="sidebar-logo-icon" aria-hidden="true">
              <LexiaLogo size={18} />
            </div>
            <span className="sidebar-logo-text">Lexia</span>
          </button>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Cerrar historial">
            <Icon name="close" size={18} />
          </button>
        </div>

        <button className="sidebar-new-chat" onClick={() => { onNewConversation(); onClose(); }}>
          <Icon name="plus" size={16} />
          Nueva consulta
        </button>

        {/* Search */}
        <div className="sidebar-search">
          <Icon name="search" size={14} className="sidebar-search-icon" />
          <input
            className="sidebar-search-input"
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Buscar en historial"
          />
          {searchQuery && (
            <button
              className="sidebar-search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
            >
              <Icon name="close" size={12} />
            </button>
          )}
        </div>

        <nav className="sidebar-conversations">
          {Object.entries(grouped).map(([dateLabel, convs]) => (
            <div key={dateLabel} className="sidebar-group">
              <span className="sidebar-group-label">{dateLabel}</span>
              <ul className="sidebar-group-list">
                {convs.map((conv) => (
                  <li key={conv.id} className="sidebar-item-container">
                    <button
                      className={`sidebar-conv-item ${conv.id === activeConversationId ? 'active' : ''}`}
                      onClick={() => { onSelectConversation(conv.id); onClose(); }}
                    >
                      <div className="sidebar-conv-info">
                        <span className="sidebar-conv-title">{conv.title}</span>
                        <span className="sidebar-conv-preview">{getLastMessage(conv)}</span>
                      </div>
                    </button>

                    <div className="sidebar-item-actions" ref={menuOpenId === conv.id ? menuRef : null}>
                      <button
                        className={`sidebar-kebab-btn ${menuOpenId === conv.id ? 'active' : ''}`}
                        onClick={(e) => handleMenuToggle(e, conv.id)}
                        aria-label="Opciones"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>

                      {menuOpenId === conv.id && (
                        <div className="sidebar-menu-dropdown">
                          <button onClick={(e) => { e.stopPropagation(); onSelectConversation(conv.id); onClose(); }}>
                            <Icon name="open" size={14} /> Abrir
                          </button>
                          <button onClick={(e) => handleRenameClick(e, conv)}>
                            <Icon name="edit" size={14} /> Renombrar
                          </button>
                          <button className="danger" onClick={(e) => handleDeleteClick(e, conv)}>
                            <Icon name="trash" size={14} /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="sidebar-empty">
              <div className="sidebar-empty-icon">
                <Icon name="message-circle" size={24} />
              </div>
              <p>Sin conversaciones</p>
              <span>Inicia una nueva consulta legal</span>
            </div>
          )}

          {conversations.length > 0 && filteredConversations.length === 0 && (
            <div className="sidebar-empty">
              <p>Sin resultados</p>
              <span>Prueba con otros términos</span>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          {conversations.length > 0 && (
            <button className="sidebar-clear-btn" onClick={handleClearHistoryClick}>
              <Icon name="trash" size={14} />
              Borrar historial
            </button>
          )}
          <button className="sidebar-settings-btn" onClick={() => setShowSettings(!showSettings)}>
            <Icon name="settings" size={14} />
            Configuración
          </button>
        </div>

        {showSettings && (
          <div className="sidebar-settings-panel">
            <div className="settings-header">
              <h3>Configuración</h3>
              <button onClick={() => setShowSettings(false)} className="settings-close" aria-label="Cerrar configuración">
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className="settings-section">
              <div className="settings-status">
                <Icon name="check" size={16} />
                <span>Conectado a <strong>Google Gemini</strong></span>
              </div>
              <span className="settings-hint">Modelo: Gemini 2.5 Flash</span>
            </div>
          </div>
        )}
      </aside>

      <Modal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title="Renombrar conversación"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setRenameModalOpen(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleRenameSubmit}>Guardar</button>
          </>
        }
      >
        <div className="modal-field">
          <label>Nuevo título</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="modal-input"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
          />
        </div>
      </Modal>

      <Modal
        isOpen={deleteHistoryModalOpen}
        onClose={() => setDeleteHistoryModalOpen(false)}
        title="¿Borrar historial completo?"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteHistoryModalOpen(false)}>Cancelar</button>
            <button
              className="btn-danger"
              onClick={handleClearHistoryConfirm}
              disabled={deleteConfirmText !== 'BORRAR'}
            >
              Eliminar todo
            </button>
          </>
        }
      >
        <p className="modal-text-warning">
          Esta acción eliminará <strong>todas</strong> tus conversaciones. No se puede deshacer.
        </p>
        <div className="modal-field">
          <label>Escribe "BORRAR" para confirmar</label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="modal-input"
            placeholder="BORRAR"
            onKeyDown={(e) => e.key === 'Enter' && handleClearHistoryConfirm()}
          />
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default Sidebar;
