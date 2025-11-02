import { createContext, useContext, useRef, ReactNode } from 'react';
import { Toast } from 'primereact/toast';

interface NotificationContextType {
  showNotification: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const toast = useRef<Toast>(null);

  const showNotification = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    toast.current?.show({
      severity,
      summary: severity === 'error' ? 'Error' : severity.charAt(0).toUpperCase() + severity.slice(1),
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