import { Box, Typography, Button, Container } from '@mui/material';
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
        {t('home.welcome')}
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
        {t('home.description')}
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
        {isAuthenticated ? (
                  <Button sx={{width: '200px', color: 'white'}} component={RouterLink} to="/companies">
                    {t('navigation.companies')}
                  </Button>
                ) : (
                  <Button sx={{width: '200px', color: 'white'}}  component={RouterLink} to="/login">
                    {t('navigation.login')}
                  </Button>
                )}
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 