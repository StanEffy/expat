import { useTranslation } from 'react-i18next';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import styles from './LanguageSwitcher.module.scss';

const languages = [
  { code: 'en', name: 'English', short: 'En' },
  { code: 'fi', name: 'Suomi', short: 'Fi' },
  { code: 'sv', name: 'Svenska', short: 'Sv' },
  { code: 'uk', name: 'Українська', short: 'Uk' },
  { code: 'ru', name: 'Русский', short: 'Ru' },
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

  // Get the short code for the selected language
  const selectedLanguage = languages.find(l => l.code === selectedLanguageCode);
  const displayShort = selectedLanguage?.short || 'En';

  return (
    <Dropdown
      value={selectedLanguageCode}
      options={languages}
      onChange={handleLanguageChange}
      optionLabel="name"
      optionValue="code"
      placeholder="Language"
      className={styles.dropdown}
      valueTemplate={() => {
        return <span>{displayShort}</span>;
      }}
    />
  );
};

export default LanguageSwitcher; 