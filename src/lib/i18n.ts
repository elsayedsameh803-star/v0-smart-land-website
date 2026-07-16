export type Locale = 'en' | 'ar';

export const defaultLocale: Locale = 'en';

export const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
  ar: () => import('@/dictionaries/ar.json').then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

// Simple in-memory dictionary for client-side use
let clientDictionary: Record<string, any> | null = null;
let currentClientLocale: Locale = 'en';

export function setClientDictionary(dict: Record<string, any>, locale: Locale) {
  clientDictionary = dict;
  currentClientLocale = locale;
}

export function getClientDictionary() {
  return clientDictionary;
}

export function getCurrentLocale(): Locale {
  return currentClientLocale;
}

export function t(path: string, dict?: Record<string, any>): string {
  const d = dict || clientDictionary;
  if (!d) return path;
  
  const keys = path.split('.');
  let result: any = d;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path;
    }
  }
  
  return typeof result === 'string' ? result : path;
}