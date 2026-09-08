import i18n from './config';
import enServiceRequests from './locales/en/serviceRequests.json';
import fiServiceRequests from './locales/fi/serviceRequests.json';
import svServiceRequests from './locales/sv/serviceRequests.json';
import ruServiceRequests from './locales/ru/serviceRequests.json';
import ukServiceRequests from './locales/uk/serviceRequests.json';

export function registerServiceRequestsTranslations(): void {
  if (!i18n.hasResourceBundle('en', 'serviceRequests')) {
    i18n.addResourceBundle('en', 'serviceRequests', enServiceRequests, true, true);
    i18n.addResourceBundle('fi', 'serviceRequests', fiServiceRequests, true, true);
    i18n.addResourceBundle('sv', 'serviceRequests', svServiceRequests, true, true);
    i18n.addResourceBundle('ru', 'serviceRequests', ruServiceRequests, true, true);
    i18n.addResourceBundle('uk', 'serviceRequests', ukServiceRequests, true, true);
  }
}
