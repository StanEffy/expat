import { apiClient } from './apiClient';
import { NOTIFICATIONS_ENDPOINTS } from '@/constants/api';
import type { UserNotification } from '@/types/notification';

export const notificationService = {
  async getNotifications(): Promise<UserNotification[]> {
    const res = await apiClient.get<unknown>(NOTIFICATIONS_ENDPOINTS.LIST, {
      requireAuth: true,
    });

    if (Array.isArray(res)) {
      return res as UserNotification[];
    }

    if (res && typeof res === 'object') {
      const record = res as Record<string, unknown>;
      if (Array.isArray(record.data)) return record.data as UserNotification[];
      if (Array.isArray(record.notifications)) return record.notifications as UserNotification[];
      if (Array.isArray(record.items)) return record.items as UserNotification[];
    }

    return [];
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<unknown>(NOTIFICATIONS_ENDPOINTS.UNREAD_COUNT, {
      requireAuth: true,
    });

    if (res && typeof res === 'object') {
      const record = res as Record<string, unknown>;
      if (typeof record.count === 'number') return record.count;
      if (typeof record.unread_count === 'number') return record.unread_count;
      if (typeof record.unreadCount === 'number') return record.unreadCount;
    }

    return 0;
  },

  markAsRead(notificationId: number): Promise<unknown> {
    return apiClient.put(NOTIFICATIONS_ENDPOINTS.MARK_READ(notificationId), {}, {
      requireAuth: true,
    });
  },

  markAllAsRead(): Promise<unknown> {
    return apiClient.put(NOTIFICATIONS_ENDPOINTS.MARK_ALL_READ, {}, {
      requireAuth: true,
    });
  },
};
