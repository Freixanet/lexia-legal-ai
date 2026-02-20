import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { EXAMPLE_PROMPTS } from '../services/prompts';
import type { Attachment } from '../services/api';
import Icon from './ui/Icon';
import { LexiaLogo } from './ui/Icon';
import './LandingPage.css';

interface LandingPageProps {
  onSendMessage: (message: string, options?: { attachment?: Attachment }) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Laboral": <Icon name="briefcase" size={20} />,
  "Vivienda": <Icon name="home" size={20} />,
  "Consumo": <Icon name="shopping-cart" size={20} />,
  "Herencias": <Icon name="file-text" size={20} />,
  "Tráfico": <Icon name="car" size={20} />,
  "Datos": <Icon name="lock" size={20} />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    }
  }
};

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: smoothEase,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: smoothEase,
    }
  }
};

const LandingPage: React.FC<LandingPageProps> = ({ onSendMessage }) => {
  const [input, setInput] = useState('');
  const [showAllCards, setShowAllCards] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert("El documento es demasiado grande (máx 2.5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPendingAttachment({
        name: file.name,
        type: file.type,
        data: base64
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed && !pendingAttachment) return;
    onSendMessage(trimmed, { attachment: pendingAttachment || undefined });
    setInput('');
    setPendingAttachment(null);
  };

  const handlePromptClick = (question: string) => {
    onSendMessage(question);
  };

  const visiblePrompts = EXAMPLE_PROMPTS.slice(0, 3);
  const hiddenPrompts = EXAMPLE_PROMPTS.slice(3);

  return (
    <motion.div
      className="landing"
      role="region"
      aria-label="Página de inicio de Lexia"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decorative mesh gradient background */}
      <div className="landing-mesh" aria-hidden="true">
        <div className="landing-mesh-orb landing-mesh-orb-1" />
        <div className="landing-mesh-orb landing-mesh-orb-2" />
        <div className="landing-mesh-orb landing-mesh-orb-3" />
      </div>

      <motion.div
        className="landing-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero */}
        <motion.header className="landing-hero" variants={itemVariants}>
          <h1 className="landing-headline">
            <span className="headline-serif">Tu derecho,</span>
            <span className="headline-accent">protegido.</span>
          </h1>

          <p className="landing-subtitle">
            Asistente legal con IA que analiza tu caso, cita legislación vigente
            y diseña la estrategia más efectiva para ti.
          </p>
        </motion.header>

        {/* Search Bar */}
        <motion.form
          className="landing-search"
          onSubmit={handleSubmit}
          role="search"
          aria-label="Consulta legal"
          variants={itemVariants}
        >
          <motion.div
            className="landing-search-container"
            layoutId="chat-input-container"
          >
            {pendingAttachment && (
              <div className="chat-attachment-pill">
                <Icon name="document" size={14} />
                <span className="attachment-name">{pendingAttachment.name}</span>
                <button
                  type="button"
                  className="attachment-remove"
                  onClick={() => setPendingAttachment(null)}
                  aria-label="Quitar archivo"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            )}
            <div className="chat-input-leading-actions">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,application/pdf"
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="chat-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Adjuntar documento"
                title="Adjuntar PDF o imagen"
              >
                <Icon name="attach" size={20} />
              </button>
            </div>
            <label htmlFor="landing-search-input" className="visually-hidden">
              Tu consulta legal
            </label>
            <input
              id="landing-search-input"
              className="landing-search-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe tu situación legal..."
              autoComplete="off"
            />

            <div className="landing-search-actions">
              <button
                id="landing-submit-btn"
                className="landing-search-btn"
                type="submit"
                disabled={!input.trim() && !pendingAttachment}
                aria-label="Enviar consulta"
              >
                <Icon name="arrow-right" size={18} />
              </button>
            </div>
          </motion.div>
        </motion.form>

        {/* Example Prompts */}
        <motion.section
          className="landing-prompts"
          aria-label="Consultas de ejemplo"
          variants={itemVariants}
        >
          <h2 className="landing-prompts-title">Prueba con una consulta</h2>

          <motion.div
            className="landing-prompts-grid"
            role="list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {visiblePrompts.map((prompt, i) => (
              <motion.button
                key={i}
                className="prompt-card"
                onClick={() => handlePromptClick(prompt.question)}
                role="listitem"
                aria-label={`${prompt.category}: ${prompt.question}`}
                variants={cardVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              >
                <span className="prompt-card-icon" aria-hidden="true">
                  {CATEGORY_ICONS[prompt.category] || <Icon name="scale" size={20} />}
                </span>
                <div className="prompt-card-content">
                  <span className="prompt-card-category">{prompt.category}</span>
                  <p className="prompt-card-question">{prompt.question}</p>
                </div>
                <Icon name="arrow-right" size={14} className="prompt-card-arrow" />
              </motion.button>
            ))}

            {showAllCards && hiddenPrompts.map((prompt, i) => (
              <motion.button
                key={i + 3}
                className="prompt-card"
                onClick={() => handlePromptClick(prompt.question)}
                role="listitem"
                aria-label={`${prompt.category}: ${prompt.question}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
              >
                <span className="prompt-card-icon" aria-hidden="true">
                  {CATEGORY_ICONS[prompt.category] || <Icon name="scale" size={20} />}
                </span>
                <div className="prompt-card-content">
                  <span className="prompt-card-category">{prompt.category}</span>
                  <p className="prompt-card-question">{prompt.question}</p>
                </div>
                <Icon name="arrow-right" size={14} className="prompt-card-arrow" />
              </motion.button>
            ))}
          </motion.div>

          {hiddenPrompts.length > 0 && (
            <button
              className="prompts-toggle"
              onClick={() => setShowAllCards(!showAllCards)}
              aria-expanded={showAllCards}
            >
              {showAllCards ? 'Ver menos' : 'Ver más consultas'}
              <Icon
                name="chevron-down"
                size={14}
                className={`prompts-toggle-icon ${showAllCards ? 'rotated' : ''}`}
              />
            </button>
          )}
        </motion.section>

        {/* Footer */}
        <motion.footer className="landing-footer" variants={itemVariants}>
          <p className="landing-footer-text">
            Lexia proporciona orientación legal basada en IA. No sustituye el asesoramiento profesional.
          </p>
        </motion.footer>
      </motion.div>
    </motion.div>
  );
};

export default LandingPage;
