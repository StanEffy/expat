import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { isTokenValid } from '@/utils/auth';
import { favouriteService } from '@/services/favouriteService';
import { authService } from '@/services/authService';
import type { FavouriteItem } from '@/types/company';

export interface FavouritesContextType {
  favourites: FavouriteItem[];
  favouriteIds: Set<number>;
  loading: boolean;
  fetchFavourites: () => Promise<void>;
  initializeFromProfile: (profileFavourites: FavouriteItem[]) => void;
  toggleFavourite: (companyId: number) => Promise<boolean>;
  isFavourite: (companyId: number) => boolean;
  refreshFavourites: () => Promise<void>;
}

export const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

interface FavouritesProviderProps {
  children: ReactNode;
}

export const FavouritesProvider = ({ children }: FavouritesProviderProps) => {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const favouriteIds = useMemo(() => {
    return new Set(favourites.map((fav) => fav.company_id));
  }, [favourites]);

  const initializeFromProfile = useCallback((profileFavourites: FavouriteItem[]) => {
    setFavourites(Array.isArray(profileFavourites) ? profileFavourites : []);
    setHasFetched(true);
  }, []);

  const fetchFavourites = useCallback(async () => {
    if (hasFetched || !isTokenValid()) {
      return;
    }

    setLoading(true);
    try {
      const list = await favouriteService.getFavourites();
      setFavourites(list);
      setHasFetched(true);
    } catch {
      // Silent fail if not authenticated or error
    } finally {
      setLoading(false);
    }
  }, [hasFetched]);

  const refreshFavourites = useCallback(async () => {
    setHasFetched(false);
    await fetchFavourites();
  }, [fetchFavourites]);

  const revertOptimisticUpdate = useCallback((companyId: number, wasFavourite: boolean) => {
    setFavourites((prev) => {
      const currentFavIds = new Set(prev.map((fav) => fav.company_id));
      const nowFav = currentFavIds.has(companyId);
      if (wasFavourite && !nowFav) {
        return [...prev, { id: Date.now(), company_id: companyId }];
      }
      if (!wasFavourite && nowFav) {
        return prev.filter((fav) => fav.company_id !== companyId);
      }
      return prev;
    });
  }, []);

  const toggleFavourite = useCallback(
    async (companyId: number): Promise<boolean> => {
      const wasFavourite = favouriteIds.has(companyId);

      // Optimistic update
      setFavourites((prev) => {
        const isFav = prev.some((fav) => fav.company_id === companyId);
        if (isFav) {
          return prev.filter((fav) => fav.company_id !== companyId);
        }
        return [...prev, { id: Date.now(), company_id: companyId }];
      });

      if (!isTokenValid()) {
        revertOptimisticUpdate(companyId, wasFavourite);
        return false;
      }

      try {
        if (wasFavourite) {
          await favouriteService.removeFavourite(companyId);
        } else {
          await favouriteService.addFavourite(companyId);
        }
        return true;
      } catch (err) {
        console.error('[FavouritesContext] Toggle failed:', err);
        revertOptimisticUpdate(companyId, wasFavourite);
        return false;
      }
    },
    [favouriteIds, revertOptimisticUpdate],
  );

  const isFavourite = useCallback(
    (companyId: number): boolean => {
      return favouriteIds.has(companyId);
    },
    [favouriteIds],
  );

  useEffect(() => {
    const loadFavouritesFromProfile = async () => {
      if (hasFetched || !isTokenValid()) {
        return;
      }

      setLoading(true);
      try {
        const profile = await authService.getProfile();
        let favouritesArray: FavouriteItem[] = [];
        if (Array.isArray(profile.favourites)) {
          favouritesArray = profile.favourites;
        } else if (profile.favourites && typeof profile.favourites === 'object') {
          const favObj = profile.favourites as { data?: FavouriteItem[] };
          if (Array.isArray(favObj.data)) {
            favouritesArray = favObj.data;
          }
        }
        initializeFromProfile(favouritesArray);
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    loadFavouritesFromProfile();
  }, [hasFetched, initializeFromProfile]);

  const value: FavouritesContextType = useMemo(
    () => ({
      favourites,
      favouriteIds,
      loading,
      fetchFavourites,
      initializeFromProfile,
      toggleFavourite,
      isFavourite,
      refreshFavourites,
    }),
    [
      favourites,
      favouriteIds,
      loading,
      fetchFavourites,
      initializeFromProfile,
      toggleFavourite,
      isFavourite,
      refreshFavourites,
    ],
  );

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = (): FavouritesContextType => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};

export type { FavouriteItem as Favourite } from '@/types/company';

