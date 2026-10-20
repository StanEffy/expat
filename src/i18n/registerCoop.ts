import i18n from './config';
import enCoop from './locales/en/coop.json';
import fiCoop from './locales/fi/coop.json';
import svCoop from './locales/sv/coop.json';
import ruCoop from './locales/ru/coop.json';
import ukCoop from './locales/uk/coop.json';

export function registerCoopTranslations(): void {
  if (!i18n.hasResourceBundle('en', 'coop')) {
    i18n.addResourceBundle('en', 'coop', enCoop, true, true);
    i18n.addResourceBundle('fi', 'coop', fiCoop, true, true);
    i18n.addResourceBundle('sv', 'coop', svCoop, true, true);
    i18n.addResourceBundle('ru', 'coop', ruCoop, true, true);
    i18n.addResourceBundle('uk', 'coop', ukCoop, true, true);
  }
}
