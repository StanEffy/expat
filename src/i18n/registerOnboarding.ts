import i18n from './config';
import enOnboarding from './locales/en/onboarding.json';
import fiOnboarding from './locales/fi/onboarding.json';
import svOnboarding from './locales/sv/onboarding.json';
import ruOnboarding from './locales/ru/onboarding.json';
import ukOnboarding from './locales/uk/onboarding.json';

export function registerOnboardingTranslations(): void {
  if (!i18n.hasResourceBundle('en', 'onboarding')) {
    i18n.addResourceBundle('en', 'onboarding', enOnboarding, true, true);
    i18n.addResourceBundle('fi', 'onboarding', fiOnboarding, true, true);
    i18n.addResourceBundle('sv', 'onboarding', svOnboarding, true, true);
    i18n.addResourceBundle('ru', 'onboarding', ruOnboarding, true, true);
    i18n.addResourceBundle('uk', 'onboarding', ukOnboarding, true, true);
  }
}
