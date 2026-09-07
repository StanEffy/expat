export interface Company {
  id: number;
  name: string;
  mainbusinesslinename?: string | null;
  updated_at?: string | null;
}

export interface CompanyDetails {
  id: number;
  businessid: string;
  name: string;
  mainbusinesslinename: string;
  website: string;
  street: string;
  postcode: string;
  city: string;
  buildingnumber: string;
  apartmentnumber: string | null;
  company_description: string | null;
  recruitment_page: string | null;
  industry: string;
  size: string;
  founded: string;
  country: string;
  updated_at?: string | null;
}

export interface CompanyFilterParams {
  page?: number;
  count?: number;
  name?: string;
  mainbusinesslineid?: string;
  generalcategory?: string;
  cities?: string[];
}

export interface PaginatedCompanies {
  data: Company[];
  count?: number;
}

export type CompanyUpdateStatus = 'pending' | 'approved' | 'rejected';

export interface CompanyUpdate {
  id: number;
  company_id: number;
  company_name?: string;
  user_id: number;
  user_email?: string;
  status: CompanyUpdateStatus;
  proposed_changes: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  review_comment?: string | null;
}

export interface FavouriteItem {
  id: number;
  company_id: number;
  company?: {
    id: number;
    name: string;
    mainbusinesslinename?: string | null;
  };
}
