import React from 'react';
import './TopBar.css';

interface TopBarProps {
  onGoHome: () => void;
  onNewConversation: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  onGoHome,
  onNewConversation,
  onToggleSidebar,
  sidebarOpen,
}) => {
  return (
    <header className="topbar" role="banner">
      {/* Logo — clickable escape hatch → home */}
      <button
        className="topbar-logo"
        onClick={onGoHome}
        aria-label="Volver al inicio"
      >
        <div className="topbar-logo-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <path d="M8 24V8h2.5v13.5H20V24H8Z" fill="currentColor"/>
            <circle cx="23" cy="10" r="2.5" fill="currentColor" opacity="0.6"/>
          </svg>
        </div>
        <span className="topbar-logo-text">Lexia</span>
      </button>

      {/* Right actions */}
      <div className="topbar-actions">
        {/* Nueva consulta */}
        <button
          className="topbar-new-btn"
          onClick={onNewConversation}
          aria-label="Nueva consulta"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="topbar-btn-label">Nueva consulta</span>
        </button>

        {/* Historial toggle */}
        <button
          className={`topbar-history-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Cerrar historial' : 'Abrir historial'}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="topbar-btn-label">Historial</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
