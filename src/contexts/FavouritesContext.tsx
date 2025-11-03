import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { FAVOURITES_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';

interface Favourite {
  id: number;
  company_id: number;
  company?: {
    id: number;
    name: string;
    mainbusinesslinename?: string | null;
  };
}

interface FavouritesContextType {
  favourites: Favourite[];
  favouriteIds: Set<number>;
  loading: boolean;
  fetchFavourites: () => Promise<void>;
  toggleFavourite: (companyId: number) => Promise<boolean>;
  isFavourite: (companyId: number) => boolean;
  refreshFavourites: () => Promise<void>;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

interface FavouritesProviderProps {
  children: ReactNode;
}

export const FavouritesProvider: React.FC<FavouritesProviderProps> = ({ children }) => {
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const favouriteIds = new Set(favourites.map(fav => fav.company_id));

  const fetchFavourites = useCallback(async () => {
    // Only fetch if we haven't already fetched
    if (hasFetched) {
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        setLoading(false);
        return;
      }

      const response = await fetch(FAVOURITES_ENDPOINTS.LIST, { headers });

      if (response.ok) {
        const data = await response.json();
        setFavourites(Array.isArray(data) ? data : []);
        setHasFetched(true);
      }
    } catch (err) {
      // Silent fail - user might not be logged in
    } finally {
      setLoading(false);
    }
  }, [hasFetched]);

  const refreshFavourites = useCallback(async () => {
    setHasFetched(false); // Reset to allow refetch
    await fetchFavourites();
  }, [fetchFavourites]);

  const toggleFavourite = useCallback(async (companyId: number): Promise<boolean> => {
    const isFav = favouriteIds.has(companyId);
    
    // Optimistic update
    if (isFav) {
      setFavourites(prev => prev.filter(fav => fav.company_id !== companyId));
    } else {
      setFavourites(prev => [...prev, {
        id: Date.now(), // Temporary ID
        company_id: companyId,
      }]);
    }

    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) {
        // Revert optimistic update
        setFavourites(prev => isFav 
          ? [...prev, { id: Date.now(), company_id: companyId }]
          : prev.filter(fav => fav.company_id !== companyId)
        );
        return false;
      }

      const endpoint = isFav
        ? FAVOURITES_ENDPOINTS.REMOVE(companyId)
        : FAVOURITES_ENDPOINTS.ADD(companyId);

      const method = isFav ? 'DELETE' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[FavouritesContext] Request failed:', {
          endpoint,
          method,
          status: response.status,
          error: errorText,
        });
        // Revert optimistic update
        setFavourites(prev => isFav 
          ? [...prev, { id: Date.now(), company_id: companyId }]
          : prev.filter(fav => fav.company_id !== companyId)
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error('[FavouritesContext] Request error:', err);
      // Revert optimistic update
      setFavourites(prev => isFav 
        ? [...prev, { id: Date.now(), company_id: companyId }]
        : prev.filter(fav => fav.company_id !== companyId)
      );
      return false;
    }
  }, [favouriteIds]);

  const isFavourite = useCallback((companyId: number): boolean => {
    return favouriteIds.has(companyId);
  }, [favouriteIds]);

  // Fetch favourites on mount
  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const value: FavouritesContextType = {
    favourites,
    favouriteIds,
    loading,
    fetchFavourites,
    toggleFavourite,
    isFavourite,
    refreshFavourites,
  };

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = (): FavouritesContextType => {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};

