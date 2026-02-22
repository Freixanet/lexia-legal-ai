/** Clave localStorage para indicar que el usuario ha iniciado sesión (flujo: login → pantalla principal → chat). */
export const AUTH_LOGGED_IN_KEY = 'lexia-logged-in';

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_LOGGED_IN_KEY) === 'true';
}

export function setLoggedIn(): void {
  localStorage.setItem(AUTH_LOGGED_IN_KEY, 'true');
}

export function clearLoggedIn(): void {
  localStorage.removeItem(AUTH_LOGGED_IN_KEY);
}
