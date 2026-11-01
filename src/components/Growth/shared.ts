import { ApiError } from '@/services/apiClient';

export const CITY_IDS = ['helsinki', 'espoo', 'vantaa', 'tampere', 'turku', 'oulu'] as const;

export const CITY_NAMES: Record<string, string> = {
  helsinki: 'Helsinki',
  espoo: 'Espoo',
  vantaa: 'Vantaa',
  tampere: 'Tampere',
  turku: 'Turku',
  oulu: 'Oulu',
};

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'] as const;

// Everything the searchable picker offers: ISO 639-1 codes of living languages people speak in Finland and beyond
export const ALL_LANGUAGES = [
  'fi', 'sv', 'en', 'se', 'af', 'am', 'ar', 'az', 'be', 'bg', 'bn', 'bs', 'ca', 'cs', 'cy', 'da', 'de', 'el', 'eo',
  'es', 'et', 'eu', 'fa', 'fil', 'fo', 'fr', 'ga', 'gl', 'gu', 'ha', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'ig', 'is',
  'it', 'ja', 'ka', 'kk', 'km', 'kn', 'ko', 'ku', 'ky', 'lo', 'lt', 'lv', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my',
  'ne', 'nl', 'no', 'om', 'pa', 'pl', 'ps', 'pt', 'ro', 'ru', 'rw', 'sd', 'si', 'sk', 'sl', 'so', 'sq', 'sr', 'sw',
  'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tr', 'tt', 'ug', 'uk', 'ur', 'uz', 'vi', 'wo', 'xh', 'yi', 'yo', 'zh', 'zu',
];

/** The language's own name for itself, e.g. "fi" -> "Suomi"; empty when the browser does not know it. */
export function endonym(code: string): string {
  try {
    const name = new Intl.DisplayNames([code], { type: 'language' }).of(code);
    if (!name || name === code) return '';
    return name.charAt(0).toLocaleUpperCase(code) + name.slice(1);
  } catch {
    return '';
  }
}

/** Human-readable language name in the UI language, e.g. "fi" -> "Finnish" / "финский". */
export function languageName(code: string, uiLanguage: string): string {
  try {
    const names = new Intl.DisplayNames([uiLanguage], { type: 'language' });
    const name = names.of(code) ?? code;
    // Some locales (ru, uk, fi, sv) give lowercase names; they are used as titles here
    return name.charAt(0).toLocaleUpperCase(uiLanguage) + name.slice(1);
  } catch {
    return code;
  }
}

export function formatDate(iso: string | undefined, uiLanguage: string): string {
  if (!iso) return '';
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(uiLanguage, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** The server's message for API errors, otherwise the fallback text. */
export function errorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.message) return err.message;
  return fallback;
}

export function percent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value * 100)}%`;
}
