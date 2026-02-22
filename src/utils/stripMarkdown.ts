/**
 * Convierte markdown a texto plano (sin formato) para copiar al portapapeles.
 */
export function stripMarkdown(md: string): string {
  if (!md || typeof md !== 'string') return '';
  let s = md
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1)) // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links -> link text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1') // strikethrough
    .replace(/^\s*[-*+]\s+/gm, '') // list bullets (simple)
    .replace(/^\s*\d+\.\s+/gm, '') // numbered list
    .replace(/^>\s+/gm, '') // blockquote
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return s;
}
