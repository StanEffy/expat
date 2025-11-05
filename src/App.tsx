import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import AdminRouteGuard from './components/AdminRouteGuard';
import Home from './pages/Home';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Profile from './pages/Profile';
import About from './pages/About';
import Shop from './pages/Shop';
import PasswordResetRequest from './pages/PasswordResetRequest';
import PasswordReset from './pages/PasswordReset';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import CompanyUpdates from './pages/admin/CompanyUpdates';
import { NotificationProvider } from './contexts/NotificationContext';
import { FavouritesProvider } from './contexts/FavouritesContext';
import { useState } from 'react';

function App() {
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <NotificationProvider>
        <FavouritesProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout currentLanguage={language} onLanguageChange={handleLanguageChange}><Home /></Layout>} />
              <Route path="/companies" element={<Layout currentLanguage={language} onLanguageChange={handleLanguageChange}><Companies /></Layout>} />
              <Route path="/companies/:id" element={<Layout currentLanguage={language} onLanguageChange={handleLanguageChange}><CompanyDetails /></Layout>} />
              <Route path="/categories" element={<Layout currentLanguage={language} onLanguageChange={handleLanguageChange}><Categories /></Layout>} />
              <Route path="/about" element={<Layout currentLanguage={language} onLanguageChange={handleLanguageChange}><About /></Layout>} />
              <Route path="/shop" element={<Layout currentLanguage={language} onLanguageChange={handleLanguageChange}><Shop /></Layout>} />
              <Route path="/login" element={<Layout currentLanguage={language} onLanguageChange={handleLanguageChange}><Login /></Layout>} />
              <Route path="/profile" element={<Layout currentLanguage={language} onLanguageChange={handleLanguageChange}><Profile /></Layout>} />
              <Route path="/password-reset/request" element={<Layout currentLanguage={language} onLanguageChange={handleLanguageChange}><PasswordResetRequest /></Layout>} />
              <Route path="/password-reset" element={<Layout currentLanguage={language} onLanguageChange={handleLanguageChange}><PasswordReset /></Layout>} />
              
              {/* Admin routes */}
              <Route
                path="/management"
                element={
                  <AdminRouteGuard>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </AdminRouteGuard>
                }
              />
              <Route
                path="/management/users"
                element={
                  <AdminRouteGuard>
                    <AdminLayout>
                      <UsersManagement />
                    </AdminLayout>
                  </AdminRouteGuard>
                }
              />
              <Route
                path="/management/company-updates"
                element={
                  <AdminRouteGuard>
                    <AdminLayout>
                      <CompanyUpdates />
                    </AdminLayout>
                  </AdminRouteGuard>
                }
              />
            </Routes>
          </Router>
        </FavouritesProvider>
      </NotificationProvider>
    </I18nextProvider>
  );
}

export default App;
