import { apiClient } from './apiClient';
import { ADMIN_ENDPOINTS } from '@/constants/api';
import type { AdminUser, InviteCode, CompanyUpdate, CompanyUpdateStatus } from '@/types';

export const adminService = {
  async getUsers(): Promise<AdminUser[]> {
    const res = await apiClient.get<{ data?: AdminUser[] } | AdminUser[]>(
      ADMIN_ENDPOINTS.USERS,
      { requireAuth: true, requireAdmin2FA: true },
    );
    return Array.isArray(res) ? res : res?.data ?? [];
  },

  assignRole(userId: number, role: string): Promise<unknown> {
    return apiClient.post(
      ADMIN_ENDPOINTS.ASSIGN_ROLE,
      { user_id: userId, role },
      { requireAuth: true, requireAdmin2FA: true },
    );
  },

  removeRole(userId: number, role: string): Promise<unknown> {
    return apiClient.post(
      ADMIN_ENDPOINTS.REMOVE_ROLE,
      { user_id: userId, role },
      { requireAuth: true, requireAdmin2FA: true },
    );
  },

  createEditorInviteCode(companyId: number): Promise<InviteCode> {
    return apiClient.post<InviteCode>(
      ADMIN_ENDPOINTS.CREATE_EDITOR_INVITE_CODE,
      { company_id: companyId },
      { requireAuth: true, requireAdmin2FA: true },
    );
  },

  async getCompanyUpdates(status?: CompanyUpdateStatus): Promise<CompanyUpdate[]> {
    const endpoint = ADMIN_ENDPOINTS.COMPANY_UPDATES(status);
    const res = await apiClient.get<{ data?: CompanyUpdate[] } | CompanyUpdate[]>(endpoint, {
      requireAuth: true,
      requireAdmin2FA: true,
    });
    return Array.isArray(res) ? res : res?.data ?? [];
  },

  approveCompanyUpdate(updateId: number): Promise<unknown> {
    return apiClient.post(
      ADMIN_ENDPOINTS.APPROVE_UPDATE,
      { update_id: updateId },
      { requireAuth: true, requireAdmin2FA: true },
    );
  },

  rejectCompanyUpdate(updateId: number, comment?: string): Promise<unknown> {
    return apiClient.post(
      ADMIN_ENDPOINTS.REJECT_UPDATE,
      { update_id: updateId, comment },
      { requireAuth: true, requireAdmin2FA: true },
    );
  },
};
