import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';
import styles from './CategoryFilter.module.scss';

export interface BackendCategoryItem {
  mainbusinessline?: string | null; // id/code
  name?: string | null; // FI
  name_en?: string | null; // EN
}

export interface GeneralCategoryItem {
  id: number;
  code: string;
  name_fi: string;
  name_en: string;
}

interface CategoryFilterProps {
  categories: BackendCategoryItem[];
  generalCategories?: GeneralCategoryItem[];
  value: string;
  onChange: (event: { value: string }) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, generalCategories = [], value, onChange }) => {
  const { t, i18n } = useTranslation();

  // Build NACE groups
  const naceEnglish = categories
    .filter((c) => (c.name_en ?? '').trim().length > 0)
    .map((c) => ({ id: (c.mainbusinessline ?? '').toString(), label: (c.name_en ?? '').trim() }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const naceFinnish = categories
    .filter((c) => !c.name_en || (c.name_en ?? '').trim().length === 0)
    .map((c) => ({ id: (c.mainbusinessline ?? '').toString(), label: (c.name ?? '').trim() }))
    .filter((c) => c.label.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label));

  const general = (generalCategories || [])
    .map((g) => ({ id: `general:${g.code}`, label: i18n.language === 'fi' ? g.name_fi : g.name_en }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Create option groups for PrimeReact Dropdown
  const allOptions: { id: string; label: string }[] = [];

  // Add "All" option
  allOptions.push({ id: '', label: t('common.all') });

  // Add general categories
  if (general.length > 0) {
    allOptions.push(...general);
  }

  // Add NACE English
  if (naceEnglish.length > 0) {
    allOptions.push(...naceEnglish);
  }

  // Add NACE Finnish
  if (naceFinnish.length > 0) {
    allOptions.push(...naceFinnish);
  }

  return (
    <Dropdown
      value={value}
      options={allOptions}
      onChange={(e) => onChange({ value: e.value || '' })}
      optionLabel="label"
      optionValue="id"
      placeholder={t('company.filter.workArea')}
      className={styles.dropdown}
      appendTo="self"
      showClear
    />
  );
};

export default CategoryFilter;
