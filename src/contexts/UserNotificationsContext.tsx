import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { NOTIFICATIONS_ENDPOINTS } from '../constants/api';
import { getAuthHeaders, isTokenValid } from '../utils/auth';

export interface UserNotification {
  id: number;
  user_id: number;
  company_id: number;
  notification_type: string;
  title?: string;
  message: string;
  read: boolean;
  created_at: string;
  company?: {
    id?: number;
    name?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface UserNotificationsContextValue {
  notifications: UserNotification[];
  unreadCount: number;
  loading: boolean;
  refreshing: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  clear: () => void;
}

const UserNotificationsContext = createContext<UserNotificationsContextValue | undefined>(
  undefined,
);

const mapNotification = (raw: Record<string, unknown>): UserNotification => {
  const readFlag =
    typeof raw.read === 'boolean'
      ? raw.read
      : typeof raw.is_read === 'boolean'
      ? raw.is_read
      : Boolean(raw.read_at);

  return {
    id: Number(raw.id),
    user_id: Number(raw.user_id),
    company_id: Number(raw.company_id),
    notification_type: String(raw.notification_type ?? ''),
    title: typeof raw.title === 'string' ? raw.title : undefined,
    message: typeof raw.message === 'string' ? raw.message : '',
    read: readFlag,
    created_at:
      typeof raw.created_at === 'string'
        ? raw.created_at
        : typeof raw.createdAt === 'string'
        ? raw.createdAt
        : '',
    company:
      typeof raw.company === 'object' && raw.company !== null
        ? (raw.company as UserNotification['company'])
        : undefined,
  };
};

interface UserNotificationsProviderProps {
  children: ReactNode;
}

export const UserNotificationsProvider = ({ children }: UserNotificationsProviderProps) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const clear = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isTokenValid()) {
      clear();
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) {
      clear();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(NOTIFICATIONS_ENDPOINTS.LIST, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const payload = await response.json();
      const list = Array.isArray(payload) ? payload.map(mapNotification) : [];
      setNotifications(list);
    } catch (err) {
      console.error('[Notifications] Failed to fetch notifications', err);
      clear();
    } finally {
      setLoading(false);
    }
  }, [clear]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isTokenValid()) {
      clear();
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) {
      clear();
      return;
    }

    try {
      const response = await fetch(NOTIFICATIONS_ENDPOINTS.UNREAD_COUNT, { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      const data = await response.json();
      const count = typeof data?.count === 'number' ? data.count : 0;
      setUnreadCount(count);
    } catch (err) {
      console.error('[Notifications] Failed to fetch unread count', err);
      setUnreadCount(0);
    }
  }, [clear]);

  const refreshNotifications = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = useCallback(
    async (notificationId: number) => {
      if (!isTokenValid()) {
        clear();
        return false;
      }

      const headers = getAuthHeaders();
      if (!headers) {
        clear();
        return false;
      }

      try {
        const response = await fetch(NOTIFICATIONS_ENDPOINTS.MARK_READ(notificationId), {
          method: 'PUT',
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to mark as read');
        }

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  read: true,
                }
              : notification,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        return true;
      } catch (err) {
        console.error('[Notifications] Failed to mark notification as read', err);
        return false;
      }
    },
    [clear],
  );

  const markAllAsRead = useCallback(async () => {
    if (!isTokenValid()) {
      clear();
      return false;
    }

    const headers = getAuthHeaders();
    if (!headers) {
      clear();
      return false;
    }

    try {
      const response = await fetch(NOTIFICATIONS_ENDPOINTS.MARK_ALL_READ, {
        method: 'PUT',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to mark all as read');
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('[Notifications] Failed to mark all notifications as read', err);
      return false;
    }
  }, [clear]);

  useEffect(() => {
    if (isTokenValid()) {
      refreshNotifications();
    } else {
      clear();
    }
  }, [refreshNotifications, clear]);

  const value = useMemo<UserNotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      loading,
      refreshing,
      fetchNotifications,
      fetchUnreadCount,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      clear,
    }),
    [
      notifications,
      unreadCount,
      loading,
      refreshing,
      fetchNotifications,
      fetchUnreadCount,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      clear,
    ],
  );

  return (
    <UserNotificationsContext.Provider value={value}>
      {children}
    </UserNotificationsContext.Provider>
  );
};

export const useUserNotifications = () => {
  const context = useContext(UserNotificationsContext);
  if (!context) {
    throw new Error('useUserNotifications must be used within a UserNotificationsProvider');
  }
  return context;
};


