/**
 * Clave y formato del consentimiento de cookies (RGPD).
 * Opciones granulares: necesarias (siempre), analíticas, personalización.
 */
export const COOKIE_CONSENT_KEY = 'lexia-cookie-consent';

export type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  personalization: boolean;
};

export const DEFAULT_CONSENT_NEEDED_ONLY: CookieConsent = {
  necessary: true,
  analytics: false,
  personalization: false,
};

export const DEFAULT_CONSENT_ALL: CookieConsent = {
  necessary: true,
  analytics: true,
  personalization: true,
};

export function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (typeof parsed.necessary !== 'boolean') return null;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      personalization: Boolean(parsed.personalization),
    };
  } catch {
    return null;
  }
}

export function setStoredConsent(consent: CookieConsent): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
}
