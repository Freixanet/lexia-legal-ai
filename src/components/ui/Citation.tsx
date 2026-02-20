import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import Icon from './Icon';
import './Citation.css';

interface CitationProps {
  id: string;
  source?: {
    title: string;
    url?: string;
  };
}

const Citation: React.FC<CitationProps> = ({ id, source }) => {
  const [copied, setCopied] = useState(false);

  if (!source) {
    return <span className="citation-badge-fallback">[{id}]</span>;
  }

  const handleCopyCitation = async () => {
    const text = source.url
      ? `[${id}] ${source.title} — ${source.url}`
      : `[${id}] ${source.title}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="citation-trigger" aria-label={`Ver fuente ${id}`}>
          {id}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="citation-popover-content" sideOffset={5}>
          <div className="citation-header">
            <span className="citation-id">Fuente {id}</span>
          </div>
          <div className="citation-body">
            <p className="citation-title">{source.title}</p>
            <div className="citation-actions">
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="citation-link"
                >
                  <Icon name="external-link" size={12} />
                  Abrir enlace
                </a>
              )}
              <button className="citation-copy-btn" onClick={handleCopyCitation}>
                {copied ? (
                  <><Icon name="check" size={12} /> Copiada</>
                ) : (
                  <><Icon name="copy" size={12} /> Copiar cita</>
                )}
              </button>
            </div>
          </div>
          <Popover.Arrow className="citation-popover-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default Citation;
