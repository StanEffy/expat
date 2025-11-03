import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import Layout from './components/Layout';
import Home from './pages/Home';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import Categories from './pages/Categories';
import Login from './pages/Login';
import Profile from './pages/Profile';
import About from './pages/About';
import { NotificationProvider } from './contexts/NotificationContext';
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
        <Router>
          <Layout currentLanguage={language} onLanguageChange={handleLanguageChange}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </Router>
      </NotificationProvider>
    </I18nextProvider>
  );
}

export default App;
