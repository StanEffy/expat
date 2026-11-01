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

// Languages offered in pickers; any ISO code also works through the API
export const COMMON_LANGUAGES = [
  'fi', 'sv', 'en', 'ru', 'uk', 'ar', 'fa', 'so', 'et', 'es', 'pt', 'fr', 'de', 'it', 'pl', 'tr', 'zh',
  'hi', 'bn', 'ur', 'vi', 'th', 'ku', 'ti', 'am', 'sq', 'ro', 'ja', 'ko', 'tl',
];

/** Human-readable language name in the UI language, e.g. "fi" -> "Finnish" / "финский". */
export function languageName(code: string, uiLanguage: string): string {
  try {
    const names = new Intl.DisplayNames([uiLanguage], { type: 'language' });
    return names.of(code) ?? code;
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
