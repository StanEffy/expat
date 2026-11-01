import i18n from './config';
import enDeadlines from './locales/en/deadlines.json';
import fiDeadlines from './locales/fi/deadlines.json';
import svDeadlines from './locales/sv/deadlines.json';
import ruDeadlines from './locales/ru/deadlines.json';
import ukDeadlines from './locales/uk/deadlines.json';

export function registerDeadlinesTranslations(): void {
  if (!i18n.hasResourceBundle('en', 'deadlines')) {
    i18n.addResourceBundle('en', 'deadlines', enDeadlines, true, true);
    i18n.addResourceBundle('fi', 'deadlines', fiDeadlines, true, true);
    i18n.addResourceBundle('sv', 'deadlines', svDeadlines, true, true);
    i18n.addResourceBundle('ru', 'deadlines', ruDeadlines, true, true);
    i18n.addResourceBundle('uk', 'deadlines', ukDeadlines, true, true);
  }
}
