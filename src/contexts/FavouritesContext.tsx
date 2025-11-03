import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { FAVOURITES_ENDPOINTS, AUTH_ENDPOINTS } from '../constants/api';
import { getAuthHeaders, isTokenValid } from '../utils/auth';

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
  initializeFromProfile: (profileFavourites: Favourite[]) => void;
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

  // Create Set of favourite IDs for quick lookup - memoized for performance
  const favouriteIds = useMemo(() => {
    return new Set(favourites.map(fav => fav.company_id));
  }, [favourites]);

  const initializeFromProfile = useCallback((profileFavourites: Favourite[]) => {
    // Initialize favourites from profile data
    setFavourites(Array.isArray(profileFavourites) ? profileFavourites : []);
    setHasFetched(true);
  }, []);

  const fetchFavourites = useCallback(async () => {
    // Only fetch if we haven't already fetched
    if (hasFetched) {
      return;
    }

    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }

      const response = await fetch(FAVOURITES_ENDPOINTS.LIST, { headers });

      if (response.ok) {
        const json = await response.json();
        // Handle both { data: [...] } and [...] response formats
        const favouritesArray = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
        setFavourites(favouritesArray);
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
    // Check current state first
    const currentFavIds = new Set(favourites.map(fav => fav.company_id));
    const wasFavourite = currentFavIds.has(companyId);
    
    // Optimistic update
    setFavourites(prev => {
      const prevFavIds = new Set(prev.map(fav => fav.company_id));
      const isFav = prevFavIds.has(companyId);
      
      if (isFav) {
        return prev.filter(fav => fav.company_id !== companyId);
      } else {
        return [...prev, {
          id: Date.now(), // Temporary ID
          company_id: companyId,
        }];
      }
    });

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        // Revert optimistic update
        setFavourites(prev => {
          const prevFavIds = new Set(prev.map(fav => fav.company_id));
          const nowFavourite = prevFavIds.has(companyId);
          // If state changed (wasFavourite != nowFavourite), revert it
          if (wasFavourite && !nowFavourite) {
            return [...prev, { id: Date.now(), company_id: companyId }];
          } else if (!wasFavourite && nowFavourite) {
            return prev.filter(fav => fav.company_id !== companyId);
          }
          return prev;
        });
        return false;
      }

      const endpoint = wasFavourite
        ? FAVOURITES_ENDPOINTS.REMOVE(companyId)
        : FAVOURITES_ENDPOINTS.ADD(companyId);

      const method = wasFavourite ? 'DELETE' : 'POST';

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
        setFavourites(prev => {
          const prevFavIds = new Set(prev.map(fav => fav.company_id));
          const nowFavourite = prevFavIds.has(companyId);
          if (wasFavourite && !nowFavourite) {
            return [...prev, { id: Date.now(), company_id: companyId }];
          } else if (!wasFavourite && nowFavourite) {
            return prev.filter(fav => fav.company_id !== companyId);
          }
          return prev;
        });
        return false;
      }

      return true;
    } catch (err) {
      console.error('[FavouritesContext] Request error:', err);
      // Revert optimistic update
      setFavourites(prev => {
        const prevFavIds = new Set(prev.map(fav => fav.company_id));
        const nowFavourite = prevFavIds.has(companyId);
        if (wasFavourite && !nowFavourite) {
          return [...prev, { id: Date.now(), company_id: companyId }];
        } else if (!wasFavourite && nowFavourite) {
          return prev.filter(fav => fav.company_id !== companyId);
        }
        return prev;
      });
      return false;
    }
  }, [favourites]);

  const isFavourite = useCallback((companyId: number): boolean => {
    return favouriteIds.has(companyId);
  }, [favouriteIds]);

  // Load favourites from profile on mount if authenticated
  useEffect(() => {
    const loadFavouritesFromProfile = async () => {
      // Only load if we haven't already fetched and user is authenticated
      if (hasFetched || !isTokenValid()) {
        return;
      }

      setLoading(true);
      try {
        const headers = getAuthHeaders();
        if (!headers) {
          setLoading(false);
          return;
        }

        // Fetch profile which now includes favourites
        const response = await fetch(AUTH_ENDPOINTS.PROFILE, { headers });

        if (response.ok) {
          const profileData = await response.json();
          // Extract favourites from profile response
          if (profileData.favourites && Array.isArray(profileData.favourites)) {
            initializeFromProfile(profileData.favourites);
          } else {
            // If profile doesn't have favourites, set empty array
            initializeFromProfile([]);
          }
        }
      } catch (err) {
        // Silent fail - user might not be logged in or profile endpoint might fail
      } finally {
        setLoading(false);
      }
    };

    loadFavouritesFromProfile();
  }, [hasFetched, initializeFromProfile]);

  const value: FavouritesContextType = {
    favourites,
    favouriteIds,
    loading,
    fetchFavourites,
    initializeFromProfile,
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

