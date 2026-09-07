import { useAuth } from './useAuth';
import type { UserRole, ManagedCompany, UserProfile } from '@/types';

export type { UserRole, ManagedCompany, UserProfile };

export interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  hasRole: (role: string) => boolean;
  managedCompanies: ManagedCompany[];
  refreshProfile?: () => Promise<void>;
}

export const useUserProfile = (): UseUserProfileResult => {
  const { user, isLoading, hasRole, managedCompanies, refreshProfile } = useAuth();

  return {
    profile: user,
    loading: isLoading,
    error: null,
    hasRole,
    managedCompanies,
    refreshProfile,
  };
};

export default useUserProfile;
