import React from 'react';
import Icon from './ui/Icon';
import { LexiaLogo } from './ui/Icon';
import './TopBar.css';

interface TopBarProps {
  onGoHome: () => void;
  onNewConversation: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  designVersion: 'v1' | 'v2';
  onToggleDesign: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  onGoHome,
  onNewConversation,
  onToggleSidebar,
  sidebarOpen,
  theme,
  onToggleTheme,
  designVersion,
  onToggleDesign,
}) => {
  return (
    <header className="topbar" role="banner">
      <button
        className="topbar-logo"
        onClick={onGoHome}
        aria-label="Volver al inicio"
      >
        <div className="topbar-logo-icon" aria-hidden="true">
          <LexiaLogo size={16} />
        </div>
        <span className="topbar-logo-text">Lexia</span>
      </button>

      <div className="topbar-actions">
        {/* Design version toggle */}
        <button
          className={`topbar-design-toggle ${designVersion === 'v2' ? 'is-v2' : 'is-v1'}`}
          onClick={onToggleDesign}
          aria-label={designVersion === 'v1' ? 'Cambiar a diseño V2' : 'Cambiar a diseño V1'}
          title={designVersion === 'v1' ? 'Diseño V1 — Clic para V2' : 'Diseño V2 — Clic para V1'}
        >
          <span className="design-toggle-track">
            <span className="design-toggle-thumb" />
          </span>
          <span className="design-toggle-label">
            {designVersion === 'v1' ? 'V1' : 'V2'}
          </span>
        </button>

        <button
          className="topbar-btn"
          onClick={onNewConversation}
          aria-label="Nueva consulta"
          title="Nueva consulta"
        >
          <Icon name="edit" size={16} />
          <span className="topbar-btn-label">Nueva consulta</span>
        </button>

        <button
          className={`topbar-btn ${sidebarOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Cerrar historial' : 'Abrir historial'}
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
          title={sidebarOpen ? 'Cerrar historial' : 'Historial'}
        >
          <Icon name="menu" size={16} />
          <span className="topbar-btn-label">{sidebarOpen ? 'Cerrar' : 'Historial'}</span>
        </button>

        <button
          className="topbar-btn topbar-theme-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
