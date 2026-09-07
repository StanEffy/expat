import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { isTokenValid } from '@/utils/auth';
import { notificationService } from '@/services/notificationService';
import type { UserNotification } from '@/types/notification';

export interface UserNotificationsContextValue {
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

export const UserNotificationsContext = createContext<UserNotificationsContextValue | undefined>(
  undefined,
);

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

    setLoading(true);
    try {
      const list = await notificationService.getNotifications();
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

    try {
      const count = await notificationService.getUnreadCount();
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

      try {
        await notificationService.markAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
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

    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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

export const useUserNotifications = (): UserNotificationsContextValue => {
  const context = useContext(UserNotificationsContext);
  if (!context) {
    throw new Error('useUserNotifications must be used within a UserNotificationsProvider');
  }
  return context;
};

export type { UserNotification } from '@/types/notification';

