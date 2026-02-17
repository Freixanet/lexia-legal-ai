import React, { useState, useEffect, useRef } from 'react';
import type { Conversation } from '../services/api';
import Modal from './ui/Modal';
import Toast from './ui/Toast';
import './Sidebar.css';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
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
  
  // Modal & Toast State
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteHistoryModalOpen, setDeleteHistoryModalOpen] = useState(false);
  const [targetConversation, setTargetConversation] = useState<Conversation | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [toast, setToast] = useState<{ message: string; actionLabel?: string; onAction?: () => void } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
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

  const grouped = conversations.reduce<Record<string, Conversation[]>>((acc, conv) => {
    const label = formatDate(conv.updatedAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(conv);
    return acc;
  }, {});

  // Handlers
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
    
    // Show Undo Toast
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
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M8 24V8h2.5v13.5H20V24H8Z" fill="currentColor"/>
                <circle cx="23" cy="10" r="2.5" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
            <span className="sidebar-logo-text">Lexia</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <button className="sidebar-new-chat" onClick={() => { onNewConversation(); onClose(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva consulta
        </button>

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
                      <span className="sidebar-conv-title">{conv.title}</span>
                    </button>
                    
                    {/* Kebab Menu Trigger */}
                    <div className="sidebar-item-actions" ref={menuOpenId === conv.id ? menuRef : null}>
                      <button 
                        className={`sidebar-kebab-btn ${menuOpenId === conv.id ? 'active' : ''}`}
                        onClick={(e) => handleMenuToggle(e, conv.id)}
                        aria-label="Opciones"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {menuOpenId === conv.id && (
                        <div className="sidebar-menu-dropdown">
                          <button onClick={(e) => { e.stopPropagation(); onSelectConversation(conv.id); onClose(); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            Abrir
                          </button>
                          <button onClick={(e) => handleRenameClick(e, conv)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Renombrar
                          </button>
                          <button className="danger" onClick={(e) => handleDeleteClick(e, conv)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            Eliminar
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
              <p>No hay conversaciones aún</p>
              <span>Inicia una nueva consulta legal</span>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          {conversations.length > 0 && (
            <button className="sidebar-clear-btn" onClick={handleClearHistoryClick}>
              Borrar historial
            </button>
          )}
          <button className="sidebar-settings-btn" onClick={() => setShowSettings(!showSettings)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Configuración
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="sidebar-settings-panel">
            <div className="settings-header">
              <h3>Configuración</h3>
              <button onClick={() => setShowSettings(false)} className="settings-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="settings-section">
              <div className="settings-status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Conectado a <strong>Google Gemini</strong></span>
              </div>
              <span className="settings-hint">Modelo: Gemini 2.5 Flash</span>
            </div>
          </div>
        )}
      </aside>

      {/* Rename Modal */}
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

      {/* Delete History Modal */}
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
          Esta acción eliminará <strong>todas</strong> tus conversaciones. Esta acción no se puede deshacer.
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

      {/* Toast */}
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
