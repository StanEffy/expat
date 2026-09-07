import { apiClient } from './apiClient';
import {
  API_BASE_URL,
  COMPANY_ENDPOINTS,
  CITY_ENDPOINTS,
  CATEGORY_ENDPOINTS,
} from '@/constants/api';
import type {
  Company,
  CompanyDetails,
  CompanyFilterParams,
  BackendCategoryItem,
  GeneralCategoryItem,
  BackendCityItem,
} from '@/types';

export const companyService = {
  getCompanies(params: CompanyFilterParams): Promise<Company[]> {
    const { page = 1, count = 10, mainbusinesslineid, generalcategory, cities, name } = params;

    const queryParams: Record<string, string | number | string[] | undefined> = {
      page,
      count,
    };

    if (name?.trim()) {
      queryParams.name = name.trim();
    }

    if (generalcategory?.trim()) {
      queryParams.generalcategory = generalcategory.trim();
    } else if (mainbusinesslineid?.trim()) {
      if (mainbusinesslineid.startsWith('general:')) {
        queryParams.generalcategory = mainbusinesslineid.split(':')[1];
      } else {
        const ids = mainbusinesslineid
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);
        if (ids.length > 0) {
          queryParams.mainbusinesslineid = ids.length === 1 ? ids[0] : ids;
        }
      }
    }

    if (cities && cities.length > 0) {
      queryParams.cities = cities.filter(Boolean);
    }

    return apiClient.get<Company[]>(`${API_BASE_URL}/api/companies/`, {
      params: queryParams,
      requireAuth: false,
    });
  },

  async getCompanyDetails(id: string | number): Promise<CompanyDetails> {
    const data = await apiClient.get<CompanyDetails[] | CompanyDetails>(COMPANY_ENDPOINTS.DETAILS(String(id)), {
      requireAuth: false,
    });

    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('Company not found');
      }
      return data[0];
    }

    return data;
  },

  async getCities(): Promise<string[]> {
    const res = await apiClient.get<{ data?: BackendCityItem[] } | BackendCityItem[]>(
      CITY_ENDPOINTS.LIST,
      { requireAuth: false },
    );
    const list = Array.isArray(res) ? res : res?.data ?? [];
    return list
      .map((item) => (item.city ?? '').toString().trim())
      .filter((city): city is string => Boolean(city));
  },

  async getCategories(): Promise<BackendCategoryItem[]> {
    const res = await apiClient.get<{ data?: BackendCategoryItem[] } | BackendCategoryItem[]>(
      CATEGORY_ENDPOINTS.LIST,
      { requireAuth: false },
    );
    return Array.isArray(res) ? res : res?.data ?? [];
  },

  async getGeneralCategories(): Promise<GeneralCategoryItem[]> {
    const res = await apiClient.get<{ data?: GeneralCategoryItem[] } | GeneralCategoryItem[]>(
      CATEGORY_ENDPOINTS.GENERAL,
      { requireAuth: false },
    );
    return Array.isArray(res) ? res : res?.data ?? [];
  },

  updateCompanyInfo(companyId: number | string, changes: Record<string, unknown>): Promise<unknown> {
    return apiClient.post(`${API_BASE_URL}/api/companies/${companyId}/updates`, changes, {
      requireAuth: true,
    });
  },
};
