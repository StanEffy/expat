import { useTranslation } from 'react-i18next';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import styles from './LanguageSwitcher.module.scss';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fi', name: 'Suomi' },
  { code: 'sv', name: 'Svenska' },
  { code: 'uk', name: 'Українська' },
  { code: 'ru', name: 'Русский' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  // Keep just the language code in state to align with optionValue
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>(() => {
    return i18n.language?.split('-')[0] || 'en';
  });

  // Sync with i18n when language changes (e.g., on reload or external change)
  useEffect(() => {
    const langCode = i18n.language?.split('-')[0] || 'en';
    setSelectedLanguageCode(langCode);
  }, [i18n.language]);

  const handleLanguageChange = (e: { value: string }) => {
    const newCode = e.value;
    i18n.changeLanguage(newCode);
    setSelectedLanguageCode(newCode);
    // Ensure persistence for detectors that might not cache immediately
    try {
      localStorage.setItem('i18nextLng', newCode);
    } catch {}
  };

  return (
    <Dropdown
      value={selectedLanguageCode}
      options={languages}
      onChange={handleLanguageChange}
      optionLabel="name"
      optionValue="code"
      placeholder="Language"
      className={styles.dropdown}
    />
  );
};

export default LanguageSwitcher; 