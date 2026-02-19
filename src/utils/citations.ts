export interface Source {
  id: string;
  title: string;
  url?: string;
}

export interface ParsedContent {
  cleanContent: string;
  sources: Source[];
}

/**
 * Extracts the ---SOURCES--- block and maps [n] to source details.
 */
export function parseSources(content: string): ParsedContent {
  // Make ---END SOURCES--- optional to hide incomplete JSON blocks during streaming
  const sourcesRegex = /---SOURCES---([\s\S]*?)(?:---END SOURCES---|$)/;
  const match = content.match(sourcesRegex);

  if (!match) {
    return { cleanContent: content, sources: [] };
  }

  const sourcesBlock = match[1].trim();
  const cleanContent = content.replace(sourcesRegex, '').trim();

  if (sourcesBlock === 'None') {
    return { cleanContent, sources: [] };
  }

  const sources: Source[] = sourcesBlock.split('\n')
    .map((line, index): Source | null => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('-')) return null;
      
      // Expected format: "- [Title](Url)" or "- [Title]"
      // We assign ID based on order: "1", "2", "3"...
      const lineMatch = trimmed.match(/-\s*\[([^\]]+)\](?:\(([^)]+)\))?/);
      if (lineMatch) {
        return { 
          id: (index + 1).toString(), // Simple 1-based index matching logical order
          title: lineMatch[1], 
          url: lineMatch[2] || undefined 
        };
      }
      return null;
    })
    .filter((s): s is Source => s !== null);

  return { cleanContent, sources };
}

/**
 * Transforms "[n]" text into Markdown links "[n](citation:n)"
 * so we can use a custom renderer for them.
 */
export function preprocessContent(content: string): string {
  // Regex to match [1], [2], etc.
  // Avoid matching if it's already a link like [1](...)
  // We use a negative lookahead for `(` to avoid double-linking
  return content.replace(/\[(\d+)\](?!\()/g, '[$1](citation:$1)');
}
