import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import Layout from './components/Layouts/Layout';
import AdminLayout from './components/Admin/AdminLayout';
import AdminRouteGuard from './components/Admin/AdminRouteGuard';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserNotificationsProvider } from './contexts/UserNotificationsContext';
import { FavouritesProvider } from './contexts/FavouritesContext';
import { PollsProvider } from './contexts/PollsContext';
import { ADMIN_PANEL_PATH } from './constants/api';
import { Suspense, lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Companies = lazy(() => import('./pages/Companies'));
const CompanyDetails = lazy(() => import('./pages/CompanyDetails'));
const Categories = lazy(() => import('./pages/Categories'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const About = lazy(() => import('./pages/About'));
const Shop = lazy(() => import('./pages/Shop'));
const PasswordResetRequest = lazy(() => import('./pages/PasswordResetRequest'));
const PasswordReset = lazy(() => import('./pages/PasswordReset'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const CompanyUpdates = lazy(() => import('./pages/admin/CompanyUpdates'));
const InviteCodes = lazy(() => import('./pages/admin/InviteCodes'));
const Polls = lazy(() => import('./pages/Polls'));
const PollDetail = lazy(() => import('./pages/PollDetail'));

const LoadingScreen = () => (
  <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
    <span>Loading…</span>
  </div>
);

type LazyComponent = LazyExoticComponent<ComponentType<unknown>>;

function App() {
  const renderWithLayout = (Page: LazyComponent) => (
    <Suspense fallback={<LoadingScreen />}>
      <Layout>
        <Page />
      </Layout>
    </Suspense>
  );

  const renderAdminRoute = (Page: LazyComponent) => (
    <AdminRouteGuard>
      <Suspense fallback={<LoadingScreen />}>
        <AdminLayout>
          <Page />
        </AdminLayout>
      </Suspense>
    </AdminRouteGuard>
  );

  return (
    <I18nextProvider i18n={i18n}>
      <NotificationProvider>
        <UserNotificationsProvider>
          <PollsProvider>
            <FavouritesProvider>
              <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={renderWithLayout(Home)} />
                <Route path="/companies" element={renderWithLayout(Companies)} />
                <Route path="/companies/:id" element={renderWithLayout(CompanyDetails)} />
                <Route path="/categories" element={renderWithLayout(Categories)} />
                <Route path="/about" element={renderWithLayout(About)} />
                <Route path="/shop" element={renderWithLayout(Shop)} />
                <Route path="/polls" element={renderWithLayout(Polls)} />
                <Route path="/polls/:id" element={renderWithLayout(PollDetail)} />
                <Route path="/login" element={renderWithLayout(Login)} />
                <Route path="/profile" element={renderWithLayout(Profile)} />
                <Route path="/password-reset/request" element={renderWithLayout(PasswordResetRequest)} />
                <Route path="/password-reset" element={renderWithLayout(PasswordReset)} />

                {/* Admin routes - using discreet path */}
                <Route
                  path={ADMIN_PANEL_PATH}
                  element={renderAdminRoute(AdminDashboard)}
                />
                <Route
                  path={`${ADMIN_PANEL_PATH}/users`}
                  element={renderAdminRoute(UsersManagement)}
                />
                <Route
                  path={`${ADMIN_PANEL_PATH}/company-updates`}
                  element={renderAdminRoute(CompanyUpdates)}
                />
                <Route
                  path={`${ADMIN_PANEL_PATH}/invite-codes`}
                  element={renderAdminRoute(InviteCodes)}
                />
              </Routes>
            </Router>
          </FavouritesProvider>
        </PollsProvider>
      </UserNotificationsProvider>
      </NotificationProvider>
    </I18nextProvider>
  );
}

export default App;
