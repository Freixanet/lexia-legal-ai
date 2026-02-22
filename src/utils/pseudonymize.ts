/**
 * Seudonimización RGPD: reduce el envío de datos personales a proveedores de IA (OpenAI/Anthropic).
 * Reemplaza nombres, correos y documentos de identidad por identificadores anónimos.
 */
const USER_PLACEHOLDER = '[Usuario]';
const EMAIL_PLACEHOLDER = '[correo]';
const DOC_PLACEHOLDER = '[documento]';

/** Patrones que revelan nombre propio (1-2 palabras tras el indicador). */
const NAME_PATTERNS = [
  /\b(me llamo|mi nombre es|me dicen)\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]{2,}(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]{2,})?\b/gi,
  /\b(nombre|nombre completo):\s*[A-ZÁÉÍÓÚÑa-záéíóúñ\s]{2,}(?=\s|$|,|\.)/gi,
];

/** Patrones que revelan correo electrónico (solo cuando el usuario se identifica). */
const EMAIL_PATTERNS = [
  /\b(mi correo|mi email|correo electrónico|email):\s*[^\s,\.]+@[^\s,\.]+\.[^\s,\.]+/gi,
  /\b(mi correo es|mi email es)\s+[^\s,\.]+@[^\s,\.]+\.[^\s,\.]+/gi,
];

/** Patrones que revelan DNI/NIF u otro documento de identidad. */
const DOC_PATTERNS = [
  /\b(DNI|NIF|NIE|documento de identidad):\s*[A-Z0-9\-]{4,}/gi,
  /\b(mi DNI es|mi NIF es|mi NIE es)\s+[A-Z0-9\-]{4,}/gi,
];

/**
 * Reemplaza datos personales en el texto por identificadores anónimos antes de enviar a la IA.
 */
export function pseudonymizeUserContent(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let out = text;
  out = out.replace(NAME_PATTERNS[0], (_match, prefix: string) => `${prefix} ${USER_PLACEHOLDER}`);
  out = out.replace(NAME_PATTERNS[1], (match) => {
    const colonIdx = match.indexOf(':');
    return colonIdx >= 0 ? match.slice(0, colonIdx + 1) + ' ' + USER_PLACEHOLDER : match;
  });
  out = out.replace(EMAIL_PATTERNS[0], (match) => {
    const colonIdx = match.indexOf(':');
    return colonIdx >= 0 ? match.slice(0, colonIdx + 1) + ' ' + EMAIL_PLACEHOLDER : match;
  });
  out = out.replace(EMAIL_PATTERNS[1], (_match, prefix: string) => `${prefix} ${EMAIL_PLACEHOLDER}`);
  out = out.replace(DOC_PATTERNS[0], (match) => {
    const colonIdx = match.indexOf(':');
    return colonIdx >= 0 ? match.slice(0, colonIdx + 1) + ' ' + DOC_PLACEHOLDER : match;
  });
  out = out.replace(DOC_PATTERNS[1], (_match, prefix: string) => `${prefix} ${DOC_PLACEHOLDER}`);
  return out;
}
