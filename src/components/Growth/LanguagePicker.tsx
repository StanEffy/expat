import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ALL_LANGUAGES, endonym, languageName } from './shared';
import styles from './Growth.module.scss';

// Shown first: the languages most people here are looking for
const PRIORITY = ['fi', 'sv', 'en'];

interface LanguagePickerProps {
  value: string;
  onChange: (code: string) => void;
  ariaLabel: string;
  /** codes that are already taken (e.g. languages the user has added) */
  exclude?: string[];
  /** adds an "any language" entry with value '' (for filters) */
  anyLabel?: string;
  placeholder?: string;
}

interface Option {
  code: string;
  name: string; // in the UI language
  own: string; // the language's name for itself
  haystack: string;
}

/** Searchable language combobox: shows each language in the UI language and in its own name. */
export const LanguagePicker: React.FC<LanguagePickerProps> = ({ value, onChange, ariaLabel, exclude = [], anyLabel, placeholder }) => {
  const { t, i18n } = useTranslation('growth');
  const lang = i18n.language;
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const options = useMemo<Option[]>(() => {
    const all = ALL_LANGUAGES.map((code) => {
      const name = languageName(code, lang);
      const english = languageName(code, 'en');
      // browsers without data for a locale answer in English; that is not the language's own name
      const own = code === 'en' || endonym(code) !== english ? endonym(code) : '';
      return { code, name, own: own.toLocaleLowerCase() === name.toLocaleLowerCase() ? '' : own, haystack: `${name} ${own} ${english} ${code}`.toLocaleLowerCase() };
    });
    return all.sort((a, b) => {
      const pa = PRIORITY.indexOf(a.code);
      const pb = PRIORITY.indexOf(b.code);
      if (pa !== pb) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
      return a.name.localeCompare(b.name, lang);
    });
  }, [lang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const list = options.filter((o) => !exclude.includes(o.code) && (!q || o.haystack.includes(q)));
    return anyLabel && !q ? [{ code: '', name: anyLabel, own: '', haystack: '' }, ...list] : list;
  }, [options, exclude, query, anyLabel]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const select = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      const option = filtered[active];
      if (option) select(option.code);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  };

  const selectedLabel = value ? languageName(value, lang) : anyLabel ?? '';

  return (
    <div className={styles.picker} ref={rootRef}>
      <input
        className={`${styles.input} ${styles.pickerInput}`}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[active] ? `${listId}-${active}` : undefined}
        value={open ? query : selectedLabel}
        placeholder={open ? t('languagePicker.search', 'Type a language…') : placeholder ?? selectedLabel}
        onFocus={() => {
          setOpen(true);
          setActive(0);
        }}
        onClick={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      <i className={`pi pi-chevron-down ${styles.pickerChevron}`} aria-hidden="true" />
      {open && (
        <ul className={styles.pickerList} role="listbox" id={listId} ref={listRef}>
          {filtered.length === 0 ? (
            <li className={styles.pickerEmpty}>{t('languagePicker.noResults', 'No language found')}</li>
          ) : (
            filtered.map((o, i) => (
              <li
                key={o.code || 'any'}
                id={`${listId}-${i}`}
                data-index={i}
                role="option"
                aria-selected={o.code === value}
                className={`${styles.pickerOption} ${i === active ? styles.pickerActive : ''} ${o.code === value ? styles.pickerSelected : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => select(o.code)}
              >
                <span>{o.name}</span>
                {o.own && <span className={styles.pickerOwn} lang={o.code}>{o.own}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default LanguagePicker;
