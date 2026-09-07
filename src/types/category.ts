export interface BackendCategoryItem {
  mainbusinessline?: string | null; // id/code
  name?: string | null; // FI
  name_en?: string | null; // EN
  company_count?: number | null;
}

export interface GeneralCategoryItem {
  id: number;
  code: string;
  name_fi: string;
  name_en: string;
  company_count?: number | null;
}

export interface CategoryOption {
  id: string;
  name: string;
  count?: number;
  company_count?: number;
}
