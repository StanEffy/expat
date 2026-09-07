import { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { isTokenValid, setToken, removeToken, removeAdmin2FASession } from '@/utils/auth';
import { authService } from '@/services/authService';
import type { UserProfile, ManagedCompany } from '@/types';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  managedCompanies: ManagedCompany[];
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isTokenValid());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    if (!isTokenValid()) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (token: string) => {
    setToken(token);
    setIsAuthenticated(true);
    setIsLoading(true);
    await refreshProfile();
  }, [refreshProfile]);

  const logout = useCallback(() => {
    removeToken();
    removeAdmin2FASession();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const roles = useMemo(() => {
    if (!user) return new Set<string>();
    const roleSet = new Set<string>();
    if (user.role) roleSet.add(user.role);
    if (Array.isArray(user.roles)) {
      user.roles.forEach((item) => {
        if (typeof item === 'string') {
          roleSet.add(item);
        } else if (item?.role_name) {
          roleSet.add(String(item.role_name));
        } else if (item?.role) {
          roleSet.add(String(item.role));
        }
      });
    }
    return roleSet;
  }, [user]);

  const hasRole = useCallback((role: string): boolean => roles.has(role), [roles]);

  const managedCompanies = useMemo<ManagedCompany[]>(() => {
    if (!user) return [];
    if (Array.isArray(user.managed_companies)) {
      return user.managed_companies;
    }
    if (Array.isArray(user.companies)) {
      return user.companies;
    }
    if (user.company?.id) {
      return [user.company];
    }
    if (typeof user.company_id === 'number') {
      return [{ id: user.company_id }];
    }
    return [];
  }, [user]);

  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    managedCompanies,
    login,
    logout,
    refreshProfile,
  }), [
    user,
    isAuthenticated,
    isLoading,
    hasRole,
    managedCompanies,
    login,
    logout,
    refreshProfile,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
