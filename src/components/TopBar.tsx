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
}

const TopBar: React.FC<TopBarProps> = ({
  onGoHome,
  onNewConversation,
  onToggleSidebar,
  sidebarOpen,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="topbar" role="banner">
      <a
        className="topbar-logo"
        href={import.meta.env.BASE_URL}
        onClick={(e) => {
          e.preventDefault();
          onGoHome();
        }}
        aria-label="Volver al inicio"
      >
        <div className="topbar-logo-icon" aria-hidden="true">
          <LexiaLogo size={16} />
        </div>
        <span className="topbar-logo-text">Lexia</span>
      </a>

      <div className="topbar-actions">
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
