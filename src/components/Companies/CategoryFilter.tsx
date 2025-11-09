import React from "react";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";
import styles from "./CategoryFilter.module.scss";

export interface BackendCategoryItem {
  mainbusinessline?: string | null; // id/code
  name?: string | null; // FI
  name_en?: string | null; // EN
  company_count?: number | null; // Company count for this category
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

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  generalCategories = [],
  value,
  onChange,
}) => {
  const { t, i18n } = useTranslation();

  // Helper function to format label with count
  const formatLabelWithCount = (
    name: string,
    count?: number | null,
  ): string => {
    if (count !== null && count !== undefined) {
      return `${name} (${count})`;
    }
    return name;
  };
  console.log(categories);
  // Build NACE categories - show name based on current language preference
  const naceCategories = categories
    .map((c) => {
      // Choose name based on current language, fallback to available name
      const displayName =
        i18n.language === "fi"
          ? (c.name ?? c.name_en ?? "").trim()
          : (c.name_en ?? c.name ?? "").trim();

      if (!displayName) return null;
      console.log(c.company_count);
      return {
        id: (c.mainbusinessline ?? "").toString(),
        label: formatLabelWithCount(displayName, c.company_count),
      };
    })
    .filter(
      (c): c is { id: string; label: string } =>
        c !== null && c.label.length > 0,
    )
    .sort((a, b) => a.label.localeCompare(b.label));

  const general = (generalCategories || [])
    .map((g) => ({
      id: `general:${g.code}`,
      label: i18n.language === "fi" ? g.name_fi : g.name_en,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Create option groups for PrimeReact Dropdown
  const allOptions: { id: string; label: string }[] = [];

  // Add "All" option
  allOptions.push({ id: "", label: t("common.all") });

  // Add general categories
  if (general.length > 0) {
    allOptions.push(...general);
  }

  // Add NACE categories
  if (naceCategories.length > 0) {
    allOptions.push(...naceCategories);
  }

  return (
    <Dropdown
      value={value}
      options={allOptions}
      onChange={(e) => onChange({ value: e.value || "" })}
      optionLabel="label"
      optionValue="id"
      placeholder={t("company.filter.workArea")}
      className={styles.dropdown}
      appendTo="self"
      showClear
    />
  );
};

export default CategoryFilter;
