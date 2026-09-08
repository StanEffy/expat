import i18n from './config';
import enBudgeting from './locales/en/budgeting.json';
import fiBudgeting from './locales/fi/budgeting.json';
import svBudgeting from './locales/sv/budgeting.json';
import ruBudgeting from './locales/ru/budgeting.json';
import ukBudgeting from './locales/uk/budgeting.json';

export function registerBudgetingTranslations(): void {
  if (!i18n.hasResourceBundle('en', 'budgeting')) {
    i18n.addResourceBundle('en', 'budgeting', enBudgeting, true, true);
    i18n.addResourceBundle('fi', 'budgeting', fiBudgeting, true, true);
    i18n.addResourceBundle('sv', 'budgeting', svBudgeting, true, true);
    i18n.addResourceBundle('ru', 'budgeting', ruBudgeting, true, true);
    i18n.addResourceBundle('uk', 'budgeting', ukBudgeting, true, true);
  }
}
