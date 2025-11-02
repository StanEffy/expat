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

  const handleLanguageChange = (e: { value: string }) => {
    i18n.changeLanguage(e.value);
  };

  const currentLanguageCode = i18n.language || 'en';

  return (
    <Dropdown
      value={currentLanguageCode}
      options={languages}
      onChange={handleLanguageChange}
      optionLabel="name"
      optionValue="code"
      placeholder="Language"
      style={{ minWidth: '120px' }}
      size="small"
    />
  );
};

export default LanguageSwitcher; 