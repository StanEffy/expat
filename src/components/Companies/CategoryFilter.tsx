import React, { useMemo } from "react";
import { Dropdown, type DropdownProps } from "primereact/dropdown";
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

  interface CategoryOption {
    id: string;
    name: string;
    count?: number;
  }

  const options = useMemo<CategoryOption[]>(() => {
    const naceCategories = categories
      .reduce<CategoryOption[]>((acc, c) => {
        const count = c.company_count ?? 0;
        if (count <= 0) {
          return acc;
        }

        const displayName =
          (i18n.language === "fi"
            ? (c.name ?? c.name_en)
            : (c.name_en ?? c.name)
          )
            ?.trim()
            .replace(/\s+/g, " ") ?? "";

        if (!displayName) {
          return acc;
        }

        acc.push({
          id: (c.mainbusinessline ?? "").toString(),
          name: displayName,
          count,
        });
        return acc;
      }, [])
      .sort((a, b) => a.name.localeCompare(b.name));

    const general = (generalCategories || [])
      .reduce<CategoryOption[]>((acc, g) => {
        const displayName =
          (i18n.language === "fi" ? g.name_fi : g.name_en) ?? "";
        const trimmed = displayName.trim();
        if (!trimmed) {
          return acc;
        }
        const count = g.company_count ?? 0;
        acc.push({
          id: `general:${g.code}`,
          name: trimmed,
          count,
        });
        return acc;
      }, [])
      .sort((a, b) => a.name.localeCompare(b.name));

    const allOption: CategoryOption = {
      id: "",
      name: t("common.all"),
    };

    return [allOption, ...general, ...naceCategories];
  }, [categories, generalCategories, i18n.language, t]);

  const renderOption = (option: CategoryOption) => {
    if (!option) {
      return null;
    }

    return (
      <div className={styles.optionContent}>
        <div className={styles.optionNameContainer}>
          <span className={styles.optionName}>{option.name}</span>
        </div>
        {option.count !== undefined && (
          <span className={styles.optionCount}>({option.count})</span>
        )}
      </div>
    );
  };

  const renderValue = (option: CategoryOption | null, props: DropdownProps) => {
    if (!option || !option.name) {
      return <span className={styles.placeholder}>{props.placeholder}</span>;
    }

    return (
      <div className={styles.valueContent}>
        <span className={styles.valueName}>{option.name}</span>
        {option.count !== undefined && (
          <span className={styles.optionCount}>({option.count})</span>
        )}
      </div>
    );
  };

  return (
    <Dropdown
      value={value}
      options={options}
      onChange={(e) => onChange({ value: e.value || "" })}
      optionLabel="name"
      optionValue="id"
      placeholder={t("company.filter.workArea")}
      className={styles.dropdown}
      appendTo="self"
      showClear
      itemTemplate={renderOption}
      valueTemplate={renderValue}
    />
  );
};

export default CategoryFilter;
