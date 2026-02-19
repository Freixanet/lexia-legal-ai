import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import './Citation.css';

interface CitationProps {
  id: string;
  source?: {
    title: string;
    url?: string;
  };
}

const Citation: React.FC<CitationProps> = ({ id, source }) => {
  if (!source) {
    // Fallback if source not found for this ID
    return <span className="citation-badge-fallback">[{id}]</span>;
  }

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
            {source.url && (
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="citation-link"
              >
                Abrir enlace externo
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            )}
          </div>
          <Popover.Arrow className="citation-popover-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default Citation;
