import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Container } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { NotificationProvider } from './contexts/NotificationContext';
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <Box sx={{ width: '100%', minHeight: '100vh' }}>
          <Router>
            <Layout>
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
  );
};

export default App;
