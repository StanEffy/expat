import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, ListSubheader } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
  onChange: (event: SelectChangeEvent) => void;
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

  return (
    <FormControl size="small" sx={{ minWidth: 280 }}>
      <InputLabel id="category-filter-label">{t('company.filter.workArea')}</InputLabel>
      <Select
        labelId="category-filter-label"
        value={value}
        label={t('company.filter.workArea')}
        onChange={onChange}
        renderValue={(selected) => {
          if (!selected) return t('common.all');
          // Try to resolve a label from all groups for display
          const all = [...naceEnglish, ...naceFinnish];
          const found = all.find((o) => o.id === selected);
          return found ? found.label : selected;
        }}
      >
        <MenuItem value="">{t('common.all')}</MenuItem>
        {general.length > 0 && (
          <ListSubheader disableSticky>{i18n.language === 'fi' ? 'Yleiset toimialat' : 'General Categories'}</ListSubheader>
        )}
        {general.map((opt) => (
          <MenuItem key={opt.id} value={opt.id}>
            {opt.label}
          </MenuItem>
        ))}

        {naceEnglish.length > 0 && (
          <ListSubheader disableSticky>{i18n.language === 'fi' ? 'NACE (englanniksi)' : 'NACE (English)'}</ListSubheader>
        )}
        {naceEnglish.map((opt) => (
          <MenuItem key={opt.id} value={opt.id}>
            {opt.label}
          </MenuItem>
        ))}

        {naceFinnish.length > 0 && (
          <ListSubheader disableSticky>{i18n.language === 'fi' ? 'NACE (suomeksi)' : 'NACE (Finnish)'}</ListSubheader>
        )}
        {naceFinnish.map((opt) => (
          <MenuItem key={opt.id} value={opt.id}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CategoryFilter;
