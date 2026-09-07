import { apiClient } from './apiClient';
import { FAVOURITES_ENDPOINTS } from '@/constants/api';
import type { FavouriteItem } from '@/types/company';

export const favouriteService = {
  async getFavourites(): Promise<FavouriteItem[]> {
    const res = await apiClient.get<{ data?: FavouriteItem[] } | FavouriteItem[]>(
      FAVOURITES_ENDPOINTS.LIST,
      { requireAuth: true },
    );
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  },

  addFavourite(companyId: number): Promise<unknown> {
    return apiClient.post(FAVOURITES_ENDPOINTS.ADD(companyId), {}, { requireAuth: true });
  },

  removeFavourite(companyId: number): Promise<unknown> {
    return apiClient.delete(FAVOURITES_ENDPOINTS.REMOVE(companyId), { requireAuth: true });
  },
};
