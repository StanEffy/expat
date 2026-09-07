import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState, useId } from 'react';
import styles from './LanguageSwitcher.module.scss';

interface LanguageOption {
  code: string;
  name: string;
  short: string;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'fi', name: 'Suomi', short: 'FI' },
  { code: 'sv', name: 'Svenska', short: 'SV' },
  { code: 'uk', name: 'Українська', short: 'UA' },
  { code: 'ru', name: 'Русский', short: 'RU' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>(() => {
    return i18n.language?.split('-')[0] || 'en';
  });

  // Sync with i18n when language changes externally
  useEffect(() => {
    const langCode = i18n.language?.split('-')[0] || 'en';
    setSelectedLanguageCode(langCode);
  }, [i18n.language]);

  // Click outside and Escape key listener to close the dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setSelectedLanguageCode(code);
    setIsOpen(false);
    try {
      localStorage.setItem('i18nextLng', code);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  const selectedLanguage = languages.find((l) => l.code === selectedLanguageCode) || languages[0];

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={menuId}
        aria-label="Language selection"
      >
        <i className={`pi pi-globe ${styles.globeIcon}`} aria-hidden="true" />
        <span className={styles.triggerCode}>{selectedLanguage.short}</span>
        <i
          className={`pi pi-chevron-down ${styles.arrowIcon} ${isOpen ? styles.arrowRotated : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          id={menuId}
          role="listbox"
          className={styles.menu}
          aria-label="Select language"
        >
          {languages.map((option) => {
            const isSelected = option.code === selectedLanguageCode;
            return (
              <li
                key={option.code}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                className={`${styles.menuItem} ${isSelected ? styles.menuItemSelected : ''}`}
                onClick={() => selectLanguage(option.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectLanguage(option.code);
                  }
                }}
              >
                <span className={styles.badge}>{option.short}</span>
                <span className={styles.name}>{option.name}</span>
                <span className={styles.checkWrap}>
                  {isSelected && <i className="pi pi-check" aria-hidden="true" />}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;