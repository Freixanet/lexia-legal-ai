/** Clave localStorage para la versión de diseño de la app (default | alt | v3). */
export const APP_VERSION_KEY = 'lexia-app-version';

export type AppVersion = 'default' | 'alt' | 'v3';

export function getStoredAppVersion(): AppVersion {
  try {
    const v = localStorage.getItem(APP_VERSION_KEY);
    if (v === 'default' || v === 'alt' || v === 'v3') return v;
  } catch {
    // ignore
  }
  return 'default';
}

export function setStoredAppVersion(version: AppVersion): void {
  try {
    localStorage.setItem(APP_VERSION_KEY, version);
  } catch {
    // ignore
  }
}
