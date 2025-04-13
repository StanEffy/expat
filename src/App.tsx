import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Layout from './components/Layout';
import Home from './pages/Home';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100%', minHeight: '100vh' }}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
