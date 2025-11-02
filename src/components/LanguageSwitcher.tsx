import { useTranslation } from 'react-i18next';
import { Dropdown } from 'primereact/dropdown';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fi', name: 'Suomi' },
  { code: 'sv', name: 'Svenska' },
  { code: 'uk', name: 'Українська' },
  { code: 'ru', name: 'Русский' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: { value: { code: string; name: string } }) => {
    i18n.changeLanguage(e.value.code);
  };

  const currentLanguageCode = i18n.language || 'en';

  const selectedLanguage = languages.find(lang => lang.code === currentLanguageCode) || languages[0];

  return (
    <Dropdown
      value={selectedLanguage}
      options={languages}
      onChange={handleLanguageChange}
      optionLabel="name"
      optionValue="code"
      placeholder="Language"
      style={{ minWidth: '120px' }}
    />
  );
};

export default LanguageSwitcher; 