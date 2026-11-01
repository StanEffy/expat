import i18n from './config';
import enGrowth from './locales/en/growth.json';
import fiGrowth from './locales/fi/growth.json';
import svGrowth from './locales/sv/growth.json';
import ruGrowth from './locales/ru/growth.json';
import ukGrowth from './locales/uk/growth.json';

export function registerGrowthTranslations(): void {
  if (!i18n.hasResourceBundle('en', 'growth')) {
    i18n.addResourceBundle('en', 'growth', enGrowth, true, true);
    i18n.addResourceBundle('fi', 'growth', fiGrowth, true, true);
    i18n.addResourceBundle('sv', 'growth', svGrowth, true, true);
    i18n.addResourceBundle('ru', 'growth', ruGrowth, true, true);
    i18n.addResourceBundle('uk', 'growth', ukGrowth, true, true);
  }
}
