import i18n from './config';
import enAnalytics from './locales/en/municipalAnalytics.json';
import fiAnalytics from './locales/fi/municipalAnalytics.json';
import svAnalytics from './locales/sv/municipalAnalytics.json';
import ruAnalytics from './locales/ru/municipalAnalytics.json';
import ukAnalytics from './locales/uk/municipalAnalytics.json';

export function registerMunicipalAnalyticsTranslations(): void {
  if (!i18n.hasResourceBundle('en', 'analytics')) {
    i18n.addResourceBundle('en', 'analytics', enAnalytics, true, true);
    i18n.addResourceBundle('fi', 'analytics', fiAnalytics, true, true);
    i18n.addResourceBundle('sv', 'analytics', svAnalytics, true, true);
    i18n.addResourceBundle('ru', 'analytics', ruAnalytics, true, true);
    i18n.addResourceBundle('uk', 'analytics', ukAnalytics, true, true);
  }
}
