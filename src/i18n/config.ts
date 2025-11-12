import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/common.json';
import enResumeTranslations from './locales/en/resume.json';
import fiTranslations from './locales/fi/common.json';
import fiResumeTranslations from './locales/fi/resume.json';
import svTranslations from './locales/sv/common.json';
import svResumeTranslations from './locales/sv/resume.json';
import ukTranslations from './locales/uk/common.json';
import ukResumeTranslations from './locales/uk/resume.json';
import ruTranslations from './locales/ru/common.json';
import ruResumeTranslations from './locales/ru/resume.json';

// Only initialize if not already initialized (prevents issues with HMR)
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: false, // Disable debug logging to reduce console spam
      resources: {
        en: { common: enTranslations, resume: enResumeTranslations },
        fi: { common: fiTranslations, resume: fiResumeTranslations },
        sv: { common: svTranslations, resume: svResumeTranslations },
        uk: { common: ukTranslations, resume: ukResumeTranslations },
        ru: { common: ruTranslations, resume: ruResumeTranslations },
      },
      ns: ['common', 'resume'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
    });
}

export default i18n; 