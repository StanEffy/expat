import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserNotificationsProvider } from '@/contexts/UserNotificationsContext';
import { FavouritesProvider } from '@/contexts/FavouritesContext';
import { PollsProvider } from '@/contexts/PollsContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <I18nextProvider i18n={i18n}>
      <NotificationProvider>
        <AuthProvider>
          <UserNotificationsProvider>
            <FavouritesProvider>
              <PollsProvider>
                {children}
              </PollsProvider>
            </FavouritesProvider>
          </UserNotificationsProvider>
        </AuthProvider>
      </NotificationProvider>
    </I18nextProvider>
  );
};

export default AppProviders;
