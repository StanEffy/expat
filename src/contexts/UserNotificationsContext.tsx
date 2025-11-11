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

const extractList = (payload: unknown, visited = new WeakSet()): Record<string, unknown>[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null);
  }

  if (payload && typeof payload === 'object') {
    if (visited.has(payload as Record<string, unknown>)) {
      return [];
    }
    visited.add(payload as Record<string, unknown>);

    const record = payload as Record<string, unknown>;

    const directKeys = ['data', 'notifications', 'items', 'results'];
    for (const key of directKeys) {
      const candidate = record[key];
      const list = extractList(candidate, visited);
      if (list.length > 0) {
        return list;
      }
    }

    // Fall back to scanning every property for nested arrays
    for (const value of Object.values(record)) {
      const list = extractList(value, visited);
      if (list.length > 0) {
        return list;
      }
    }

    // If object itself looks like a notification, wrap it
    if ('id' in record || 'notification_type' in record || 'message' in record) {
      return [record];
    }
  }

  return [];
};

const mapNotification = (raw: Record<string, unknown>): UserNotification => {
  const readFlag =
    typeof raw.read === 'boolean'
      ? raw.read
      : typeof raw.is_read === 'boolean'
      ? raw.is_read
      : Boolean(raw.read_at);

  const title =
    typeof raw.title === 'string'
      ? raw.title
      : typeof raw.notification_title === 'string'
      ? raw.notification_title
      : typeof raw.name === 'string'
      ? raw.name
      : undefined;

  const messageCandidate =
    typeof raw.message === 'string'
      ? raw.message
      : typeof raw.description === 'string'
      ? raw.description
      : '';

  const company =
    typeof raw.company === 'object' && raw.company !== null
      ? (raw.company as UserNotification['company'])
      : typeof raw.company_name === 'string'
      ? { name: raw.company_name }
      : undefined;

  return {
    id: Number(raw.id),
    user_id: Number(raw.user_id),
    company_id: Number(raw.company_id),
    notification_type: String(raw.notification_type ?? ''),
    title,
    message: messageCandidate || title || '',
    read: readFlag,
    created_at:
      typeof raw.created_at === 'string'
        ? raw.created_at
        : typeof raw.createdAt === 'string'
        ? raw.createdAt
        : '',
    company,
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
      const rawList = extractList(payload);
      const list = rawList.map(mapNotification).filter((item) => Number.isFinite(item.id));
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
      const count =
        typeof data?.count === 'number'
          ? data.count
          : typeof data?.unread_count === 'number'
          ? data.unread_count
          : typeof data?.unreadCount === 'number'
          ? data.unreadCount
          : 0;
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


