/** Clave para guardar que el usuario aceptó el aviso legal ineludible (primera visita). */
export const DISCLAIMER_ACCEPTED_KEY = 'lexia-legal-disclaimer-accepted';

export const DISCLAIMER_TEXT =
  'Lexia proporciona información y estrategia legal avanzada basada en inteligencia artificial, pero no sustituye el consejo legal de un abogado colegiado. No existe relación abogado-cliente.';

export function hasAcceptedDisclaimer(): boolean {
  try {
    return localStorage.getItem(DISCLAIMER_ACCEPTED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDisclaimerAccepted(): void {
  try {
    localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, 'true');
  } catch {
    // ignore
  }
}
