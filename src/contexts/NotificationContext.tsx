import { createContext, useContext, useRef, ReactNode } from 'react';
import { Toast } from 'primereact/toast';
import { useTranslation } from 'react-i18next';
import type { NotificationSeverity } from '@/types/notification';

export interface NotificationContextType {
  showNotification: (message: string, severity: NotificationSeverity) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const toast = useRef<Toast>(null);
  const { t } = useTranslation();

  const showNotification = (message: string, severity: NotificationSeverity) => {
    const primeSeverity = severity === 'warning' ? 'warn' : severity;
    toast.current?.show({
      severity: primeSeverity as 'success' | 'error' | 'info' | 'warn',
      summary: t(`notificationTitles.${severity}`, { defaultValue: severity.charAt(0).toUpperCase() + severity.slice(1) }),
      detail: message,
      life: 6000,
    });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Toast ref={toast} position="top-center" />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;