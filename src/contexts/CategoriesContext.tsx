import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CATEGORY_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';
import { useNotification } from './NotificationContext';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

interface CategoriesProviderProps {
  children: ReactNode;
}

export const CategoriesProvider: React.FC<CategoriesProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const { showNotification } = useNotification();

  const fetchCategories = async () => {
    // Only fetch if we haven't already fetched categories
    if (hasFetched && categories.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setError('Authentication required');
        return;
      }

      const response = await fetch(CATEGORY_ENDPOINTS.LIST, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch categories');
      }

      const { data } = await response.json();
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      setCategories(data);
      setHasFetched(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching categories';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    fetchCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = (): CategoriesContextType => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}; 