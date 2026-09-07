export type NotificationSeverity = 'success' | 'error' | 'info' | 'warning';

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
