import React from 'react';
import Icon from './ui/Icon';
import { LexiaLogo } from './ui/Icon';
import type { AppVersion } from '../constants/appVersion';
import './ChatLeftBar.css';

interface ChatLeftBarProps {
  onToggleSidebar: () => void;
  onGoHome: () => void;
  onNewConversation: () => void;
  onOpenDisclaimer: () => void;
  sidebarOpen: boolean;
  appVersion: AppVersion;
  onSetVersion: (v: AppVersion) => void;
}

/** Barra vertical izquierda en la pantalla de chat (desktop/tablet). Lexia, Historial, Nueva consulta, y abajo 1, 2, chat, balanza. */
const ChatLeftBar: React.FC<ChatLeftBarProps> = ({
  onToggleSidebar,
  onGoHome,
  onNewConversation,
  onOpenDisclaimer,
  sidebarOpen,
  appVersion,
  onSetVersion,
}) => {
  return (
    <aside
      className="chat-left-bar"
      role="navigation"
      aria-label="Navegación del chat"
    >
      <button
        type="button"
        className="chat-left-bar-logo"
        onClick={onGoHome}
        aria-label="Volver al inicio"
        title="Lexia"
      >
        <LexiaLogo size={25} />
      </button>
      <button
        type="button"
        className={`chat-left-bar-btn ${sidebarOpen ? 'active' : ''}`}
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? 'Cerrar historial' : 'Abrir historial'}
        aria-expanded={sidebarOpen}
        aria-controls="sidebar"
        title={sidebarOpen ? 'Cerrar historial' : 'Historial'}
      >
        <Icon name="menu" size={18} />
      </button>
      <button
        type="button"
        className="chat-left-bar-btn"
        onClick={onNewConversation}
        aria-label="Nueva consulta"
        title="Nueva consulta"
      >
        <Icon name="edit" size={18} />
      </button>

      <div className="chat-left-bar-extra" role="group" aria-label="Versión y accesos">
        <button
          type="button"
          className={`chat-left-bar-btn chat-left-bar-version-btn ${appVersion === 'default' ? 'active' : ''}`}
          onClick={() => onSetVersion('default')}
          aria-label="Versión 1"
          title="Versión 1"
        >
          1
        </button>
        <button
          type="button"
          className={`chat-left-bar-btn chat-left-bar-version-btn ${appVersion === 'alt' ? 'active' : ''}`}
          onClick={() => onSetVersion('alt')}
          aria-label="Versión 2"
          title="Versión 2"
        >
          2
        </button>
        <button
          type="button"
          className="chat-left-bar-btn"
          onClick={onNewConversation}
          aria-label="Ir al chat"
          title="Ir al chat"
        >
          <Icon name="message-circle" size={18} strokeWidth={2} />
        </button>
        <button
          type="button"
          className="chat-left-bar-btn"
          onClick={onOpenDisclaimer}
          aria-label="Ver aviso legal de entrada"
          title="Ver aviso legal de entrada"
        >
          <Icon name="balanza" size={18} strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
};

export default ChatLeftBar;
