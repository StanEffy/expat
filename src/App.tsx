import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { NotificationProvider } from './contexts/NotificationContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';
import Layout from './components/Layout';
import Home from './pages/Home';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './i18n/config';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#A07BCF',
    },
    secondary: {
      main: '#E8A654',
    },
  },
  components :{
  MuiButton: {
    styleOverrides: {
        root: {
          backgroundColor: '#5E2A9F', 
          '&:hover': {
            backgroundColor: '#7E4ABF',
          },
        },
      },
  }
  }
});

const App = () => {
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <Box sx={{ width: '100%', minHeight: '100vh' }}>
            <Router>
                         <Layout 
                currentLanguage={language}
                onLanguageChange={handleLanguageChange}
              >
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/companies/:id" element={<CompanyDetails />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </Container>
              </Layout>
            </Router>
          </Box>
        </NotificationProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
