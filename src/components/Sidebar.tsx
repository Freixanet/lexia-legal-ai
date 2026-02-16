import React, { useState } from 'react';
import type { Conversation } from '../services/api';
import './Sidebar.css';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
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
  onClearAll,
  isOpen,
  onClose,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Group conversations by date
  const grouped = conversations.reduce<Record<string, Conversation[]>>((acc, conv) => {
    const label = formatDate(conv.updatedAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(conv);
    return acc;
  }, {});

  return (
    <>
      {/* Overlay — click to dismiss */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      <aside
        id="sidebar"
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Panel lateral de navegación"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M8 24V8h2.5v13.5H20V24H8Z" fill="currentColor"/>
                <circle cx="23" cy="10" r="2.5" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
            <span className="sidebar-logo-text">Lexia</span>
          </div>
          <button
            id="sidebar-close-btn"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Cerrar menú lateral"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* New Chat Button */}
        <button
          id="new-consultation-btn"
          className="sidebar-new-chat"
          onClick={() => { onNewConversation(); onClose(); }}
          aria-label="Iniciar nueva consulta legal"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva consulta
        </button>

        {/* Conversations List */}
        <nav className="sidebar-conversations" aria-label="Historial de conversaciones">
          {Object.entries(grouped).map(([dateLabel, convs]) => (
            <div key={dateLabel} className="sidebar-group" role="group" aria-label={dateLabel}>
              <span className="sidebar-group-label" aria-hidden="true">{dateLabel}</span>
              <ul className="sidebar-group-list" role="list">
                {convs.map((conv) => (
                  <li key={conv.id} role="listitem">
                    <button
                      className={`sidebar-conv-item ${conv.id === activeConversationId ? 'active' : ''}`}
                      onClick={() => { onSelectConversation(conv.id); onClose(); }}
                      aria-label={`Conversación: ${conv.title}`}
                      aria-current={conv.id === activeConversationId ? 'true' : undefined}
                    >
                      <span className="sidebar-conv-title">{conv.title}</span>
                      <button
                        className="sidebar-conv-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        aria-label={`Eliminar conversación: ${conv.title}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="sidebar-empty" role="status">
              <p>No hay conversaciones aún</p>
              <span>Inicia una nueva consulta legal</span>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {conversations.length > 0 && (
            <button
              id="clear-history-btn"
              className="sidebar-clear-btn"
              onClick={onClearAll}
              aria-label="Borrar todo el historial de conversaciones"
            >
              Borrar historial
            </button>
          )}
          <button
            id="settings-toggle-btn"
            className="sidebar-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            aria-expanded={showSettings}
            aria-controls="settings-panel"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Configuración
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div
            id="settings-panel"
            className="sidebar-settings-panel"
            role="dialog"
            aria-label="Configuración"
            aria-modal="false"
          >
            <div className="settings-header">
              <h3>Configuración</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="settings-close"
                aria-label="Cerrar configuración"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="settings-section">
              <div className="settings-status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Conectado a <strong>Google Gemini</strong></span>
              </div>
              <span className="settings-hint">
                Modelo: Gemini 2.5 Flash
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
