import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/common.json';
import fiTranslations from './locales/fi/common.json';
import svTranslations from './locales/sv/common.json';
import ukTranslations from './locales/uk/common.json';
import ruTranslations from './locales/ru/common.json';

import enBudgeting from './locales/en/budgeting.json';
import fiBudgeting from './locales/fi/budgeting.json';
import svBudgeting from './locales/sv/budgeting.json';
import ukBudgeting from './locales/uk/budgeting.json';
import ruBudgeting from './locales/ru/budgeting.json';

import enOnboarding from './locales/en/onboarding.json';
import fiOnboarding from './locales/fi/onboarding.json';
import svOnboarding from './locales/sv/onboarding.json';
import ukOnboarding from './locales/uk/onboarding.json';
import ruOnboarding from './locales/ru/onboarding.json';

import enServiceRequests from './locales/en/serviceRequests.json';
import fiServiceRequests from './locales/fi/serviceRequests.json';
import svServiceRequests from './locales/sv/serviceRequests.json';
import ukServiceRequests from './locales/uk/serviceRequests.json';
import ruServiceRequests from './locales/ru/serviceRequests.json';

import enCommunity from './locales/en/community.json';
import fiCommunity from './locales/fi/community.json';
import svCommunity from './locales/sv/community.json';
import ukCommunity from './locales/uk/community.json';
import ruCommunity from './locales/ru/community.json';

import enAnalytics from './locales/en/municipalAnalytics.json';
import fiAnalytics from './locales/fi/municipalAnalytics.json';
import svAnalytics from './locales/sv/municipalAnalytics.json';
import ukAnalytics from './locales/uk/municipalAnalytics.json';
import ruAnalytics from './locales/ru/municipalAnalytics.json';

// Only initialize if not already initialized (prevents issues with HMR)
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: false,
      resources: {
        en: {
          common: enTranslations,
          budgeting: enBudgeting,
          onboarding: enOnboarding,
          serviceRequests: enServiceRequests,
          community: enCommunity,
          analytics: enAnalytics,
          municipalAnalytics: enAnalytics,
        },
        fi: {
          common: fiTranslations,
          budgeting: fiBudgeting,
          onboarding: fiOnboarding,
          serviceRequests: fiServiceRequests,
          community: fiCommunity,
          analytics: fiAnalytics,
          municipalAnalytics: fiAnalytics,
        },
        sv: {
          common: svTranslations,
          budgeting: svBudgeting,
          onboarding: svOnboarding,
          serviceRequests: svServiceRequests,
          community: svCommunity,
          analytics: svAnalytics,
          municipalAnalytics: svAnalytics,
        },
        uk: {
          common: ukTranslations,
          budgeting: ukBudgeting,
          onboarding: ukOnboarding,
          serviceRequests: ukServiceRequests,
          community: ukCommunity,
          analytics: ukAnalytics,
          municipalAnalytics: ukAnalytics,
        },
        ru: {
          common: ruTranslations,
          budgeting: ruBudgeting,
          onboarding: ruOnboarding,
          serviceRequests: ruServiceRequests,
          community: ruCommunity,
          analytics: ruAnalytics,
          municipalAnalytics: ruAnalytics,
        },
      },
      ns: [
        'common',
        'budgeting',
        'onboarding',
        'serviceRequests',
        'community',
        'analytics',
        'municipalAnalytics',
      ],
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