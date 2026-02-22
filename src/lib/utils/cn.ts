import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases con clsx y las fusiona con tailwind-merge para evitar conflictos de Tailwind.
 * @param inputs - Clases o condicionales (clsx)
 * @returns Cadena de clases única y mergeada
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
