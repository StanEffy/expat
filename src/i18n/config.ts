import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/common.json';
import fiTranslations from './locales/fi/common.json';
import svTranslations from './locales/sv/common.json';
import ukTranslations from './locales/uk/common.json';
import ruTranslations from './locales/ru/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    resources: {
      en: { common: enTranslations },
      fi: { common: fiTranslations },
      sv: { common: svTranslations },
      uk: { common: ukTranslations },
      ru: { common: ruTranslations },
    },
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n; 