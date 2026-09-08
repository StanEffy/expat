import i18n from './config';
import enCommunity from './locales/en/community.json';
import fiCommunity from './locales/fi/community.json';
import svCommunity from './locales/sv/community.json';
import ruCommunity from './locales/ru/community.json';
import ukCommunity from './locales/uk/community.json';

export function registerCommunityTranslations(): void {
  if (!i18n.hasResourceBundle('en', 'community')) {
    i18n.addResourceBundle('en', 'community', enCommunity, true, true);
    i18n.addResourceBundle('fi', 'community', fiCommunity, true, true);
    i18n.addResourceBundle('sv', 'community', svCommunity, true, true);
    i18n.addResourceBundle('ru', 'community', ruCommunity, true, true);
    i18n.addResourceBundle('uk', 'community', ukCommunity, true, true);
  }
}
