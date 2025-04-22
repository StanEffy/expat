import { Box, Typography, TextField, Button, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isTokenValid } from '../utils/auth';
import { Link as RouterLink } from 'react-router-dom';
const Home = () => {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsAuthenticated(isTokenValid());
  }, []);

  return (
    <Container >
      <Box sx={{ textAlign: 'center', my: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Expat
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Find companies and job opportunities in Finland
        </Typography>
        <Box sx={{ mt: 4 }}>
        {isAuthenticated ? (
                  <Button  component={RouterLink} to="/companies">
                    {t('navigation.companies')}
                  </Button>
                ) : (
                  <Button  component={RouterLink} to="/login">
                    {t('navigation.login')}
                  </Button>
                )}
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 