import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import AdminRouteGuard from './components/AdminRouteGuard';
import { NotificationProvider } from './contexts/NotificationContext';
import { FavouritesProvider } from './contexts/FavouritesContext';
import { ADMIN_PANEL_PATH } from './constants/api';
import { Suspense, lazy, useState } from 'react';
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

const LoadingScreen = () => (
  <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
    <span>Loading…</span>
  </div>
);

type LazyComponent = LazyExoticComponent<ComponentType<unknown>>;

function App() {
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const renderWithLayout = (Page: LazyComponent) => (
    <Suspense fallback={<LoadingScreen />}>
      <Layout currentLanguage={language} onLanguageChange={handleLanguageChange}>
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
            </Routes>
          </Router>
        </FavouritesProvider>
      </NotificationProvider>
    </I18nextProvider>
  );
}

export default App;
