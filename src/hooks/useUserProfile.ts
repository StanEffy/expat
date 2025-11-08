import { useEffect, useMemo, useState } from 'react';
import { AUTH_ENDPOINTS } from '../constants/api';
import { getAuthHeaders, isTokenValid } from '../utils/auth';

export interface UserRole {
  role_name?: string;
  role?: string;
  [key: string]: unknown;
}

export interface ManagedCompany {
  id: number;
  name?: string;
  [key: string]: unknown;
}

export interface UserProfile {
  id?: number;
  user_id?: number;
  name?: string;
  email?: string;
  role?: string;
  roles?: UserRole[];
  managed_companies?: ManagedCompany[];
  companies?: ManagedCompany[];
  company?: ManagedCompany;
  company_id?: number;
  [key: string]: unknown;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  hasRole: (role: string) => boolean;
  managedCompanies: ManagedCompany[];
}

export const useUserProfile = (): UseUserProfileResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isTokenValid()) {
        setLoading(false);
        return;
      }

      try {
        const headers = getAuthHeaders();
        if (!headers) {
          setLoading(false);
          return;
        }

        const response = await fetch(AUTH_ENDPOINTS.PROFILE, { headers });
        if (!response.ok) {
          const errorPayload = await response.json().catch(() => null);
          const message = errorPayload?.message ?? 'Failed to load profile';
          throw new Error(message);
        }

        const data = await response.json();
        setProfile(data);
        setError(null);
      } catch (err) {
        setProfile(null);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const roles = useMemo(() => {
    if (!profile) return new Set<string>();
    const roleSet = new Set<string>();
    if (profile.role) roleSet.add(profile.role);
    if (Array.isArray(profile.roles)) {
      profile.roles.forEach((roleItem) => {
        if (typeof roleItem === 'string') {
          roleSet.add(roleItem);
        } else if (roleItem?.role_name) {
          roleSet.add(String(roleItem.role_name));
        } else if (roleItem?.role) {
          roleSet.add(String(roleItem.role));
        }
      });
    }
    return roleSet;
  }, [profile]);

  const hasRole = (role: string): boolean => roles.has(role);

  const managedCompanies = useMemo<ManagedCompany[]>(() => {
    if (!profile) return [];
    if (Array.isArray(profile.managed_companies)) {
      return profile.managed_companies as ManagedCompany[];
    }
    if (Array.isArray(profile.companies)) {
      return profile.companies as ManagedCompany[];
    }
    if (profile.company) {
      const company = profile.company as ManagedCompany;
      if (company?.id) {
        return [company];
      }
    }
    if (typeof profile.company_id === 'number') {
      return [{ id: profile.company_id }];
    }
    return [];
  }, [profile]);

  return {
    profile,
    loading,
    error,
    hasRole,
    managedCompanies,
  };
};

export default useUserProfile;


