import { apiClient } from './apiClient';
import { AUTH_ENDPOINTS, ADMIN_ENDPOINTS, PASSWORD_RESET_ENDPOINTS } from '@/constants/api';
import type {
  UserProfile,
  TwoFAStatus,
  TwoFASetupResponse,
  TwoFAVerifyResponse,
  TwoFASessionValidation,
} from '@/types/auth';

export const authService = {
  login(body: Record<string, unknown>): Promise<{ token: string; [key: string]: unknown }> {
    return apiClient.post<{ token: string; [key: string]: unknown }>(AUTH_ENDPOINTS.LOGIN, body);
  },

  register(body: Record<string, unknown>): Promise<{ token?: string; [key: string]: unknown }> {
    return apiClient.post<{ token?: string; [key: string]: unknown }>(AUTH_ENDPOINTS.REGISTER, body);
  },

  getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>(AUTH_ENDPOINTS.PROFILE, { requireAuth: true });
  },

  requestPasswordReset(email: string): Promise<{ message?: string }> {
    return apiClient.post<{ message?: string }>(PASSWORD_RESET_ENDPOINTS.REQUEST, { email });
  },

  resetPassword(payload: Record<string, unknown>): Promise<{ message?: string }> {
    return apiClient.post<{ message?: string }>(PASSWORD_RESET_ENDPOINTS.RESET, payload);
  },

  async checkAdminRole(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      if (profile.role === 'admin') return true;
      if (Array.isArray(profile.roles)) {
        return profile.roles.some((r) => {
          if (typeof r === 'string') return r === 'admin';
          return r?.role_name === 'admin' || r?.role === 'admin';
        });
      }
      return false;
    } catch {
      return false;
    }
  },

  getTwoFAStatus(): Promise<TwoFAStatus> {
    return apiClient.get<TwoFAStatus>(ADMIN_ENDPOINTS['2FA_STATUS'], { requireAuth: true });
  },

  setupTwoFA(): Promise<TwoFASetupResponse> {
    return apiClient.post<TwoFASetupResponse>(ADMIN_ENDPOINTS['2FA_SETUP'], {}, { requireAuth: true });
  },

  verifyTwoFA(token: string): Promise<TwoFAVerifyResponse> {
    return apiClient.post<TwoFAVerifyResponse>(
      ADMIN_ENDPOINTS['2FA_VERIFY'],
      { token },
      { requireAuth: true },
    );
  },

  validateTwoFASession(): Promise<TwoFASessionValidation> {
    return apiClient.post<TwoFASessionValidation>(
      ADMIN_ENDPOINTS['2FA_SESSION_VALIDATE'],
      {},
      { requireAuth: true, requireAdmin2FA: true },
    );
  },
};
