import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState, useId } from 'react';
import { applyTheme, getThemeChoice, type ThemeChoice } from '../../utils/theme';
// Same look as the language picker next to it
import styles from './LanguageSwitcher.module.scss';

const options: { value: ThemeChoice; icon: string }[] = [
  { value: 'light', icon: 'pi-sun' },
  { value: 'dark', icon: 'pi-moon' },
  { value: 'system', icon: 'pi-desktop' },
];

const ThemeSwitcher = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [choice, setChoice] = useState<ThemeChoice>(getThemeChoice);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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

  const select = (value: ThemeChoice) => {
    applyTheme(value);
    setChoice(value);
    setIsOpen(false);
  };

  const current = options.find((o) => o.value === choice) || options[2];
  const label = `${t('theme.label', 'Theme')}: ${t(`theme.${choice}`)}`;

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={menuId}
        aria-label={label}
        title={label}
      >
        <i className={`pi ${current.icon} ${styles.globeIcon}`} aria-hidden="true" />
        <i
          className={`pi pi-chevron-down ${styles.arrowIcon} ${isOpen ? styles.arrowRotated : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul id={menuId} role="listbox" className={styles.menu} aria-label={t('theme.label', 'Theme')}>
          {options.map((option) => {
            const isSelected = option.value === choice;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                className={`${styles.menuItem} ${isSelected ? styles.menuItemSelected : ''}`}
                onClick={() => select(option.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    select(option.value);
                  }
                }}
              >
                <span className={styles.badge}>
                  <i className={`pi ${option.icon}`} aria-hidden="true" />
                </span>
                <span className={styles.name}>{t(`theme.${option.value}`)}</span>
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

export default ThemeSwitcher;
