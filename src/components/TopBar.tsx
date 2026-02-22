import React from 'react';
import { Link } from 'react-router-dom';
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
  /** En true (página de inicio) muestra Iniciar sesión / Regístrate gratis. En false (chat) muestra Nueva consulta / Historial. */
  isLanding: boolean;
  /** En true (página de chat) la barra no se muestra (sin fondo ni borde), solo el contenido. */
  isChatView?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({
  onGoHome,
  onNewConversation,
  onToggleSidebar,
  sidebarOpen,
  theme,
  onToggleTheme,
  isLanding,
  isChatView = false,
}) => {
  return (
    <header
      className={`topbar ${isChatView ? 'topbar--no-bar topbar--mobile-chat' : ''}`}
      role="banner"
    >
      {/* En móvil + chat: izquierda = historial + Lexia (solo texto); sin icono de logo */}
      {isChatView && (
        <div className="topbar-chat-left">
          <button
            type="button"
            className={`topbar-btn topbar-btn-historial ${sidebarOpen ? 'active' : ''}`}
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Cerrar historial' : 'Abrir historial'}
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            title={sidebarOpen ? 'Cerrar historial' : 'Historial'}
          >
            <Icon name="menu" size={16} />
          </button>
          <button
            type="button"
            className="topbar-logo-text-only"
            onClick={onGoHome}
            aria-label="Volver al inicio"
            title="Lexia"
          >
            Lexia
          </button>
        </div>
      )}

      {/* Logo con icono: oculto en escritorio en chat; oculto en móvil en chat (ahí se usa solo texto) */}
      {!isChatView && (
        <a
          className="topbar-logo topbar-logo--chat-hide-desktop"
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
      )}

      <div className="topbar-actions">
        {isLanding ? (
          <>
            <Link
              to="/iniciar-sesion"
              className="topbar-btn topbar-btn-landing-signin"
              aria-label="Iniciar sesión"
              title="Iniciar sesión"
            >
              <span className="topbar-btn-label">Iniciar sesión</span>
            </Link>
            <button
              type="button"
              className="topbar-btn topbar-btn-primary topbar-btn-landing-primary"
              aria-label="Primera vez"
              title="Primera vez"
              onClick={() => {}}
            >
              <span className="topbar-btn-label">Primera vez</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="topbar-btn topbar-btn-new-chat"
              onClick={onNewConversation}
              aria-label="Nueva consulta"
              title="Nueva consulta"
            >
              <Icon name="edit" size={16} />
              <span className="topbar-btn-label">Nueva consulta</span>
            </button>
            {!isChatView && (
              <button
                type="button"
                className={`topbar-btn topbar-btn-historial ${sidebarOpen ? 'active' : ''}`}
                onClick={onToggleSidebar}
                aria-label={sidebarOpen ? 'Cerrar historial' : 'Abrir historial'}
                aria-expanded={sidebarOpen}
                aria-controls="sidebar"
                title={sidebarOpen ? 'Cerrar historial' : 'Historial'}
              >
                <Icon name="menu" size={16} />
                <span className="topbar-btn-label">{sidebarOpen ? 'Cerrar' : 'Historial'}</span>
              </button>
            )}
          </>
        )}

        <button
          type="button"
          className={`topbar-btn topbar-theme-btn ${isChatView ? 'topbar-theme-btn--show-mobile-chat' : 'topbar-theme-btn--hide-in-chat'}`}
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
