import { ReactNode, useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { isTokenValid } from '../utils/auth';
import MobileMenu from './MobileMenu';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setIsAuthenticated(isTokenValid());
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      <AppBar position="static" sx={{ width: '100%' }}>
        <Toolbar>
          <RouterLink to={"/"}>
            <Box
              component="img"
              src="../src/assets/logo_expat.png"
              alt="Expat Logo"
              sx={{ height: 20, mr: 2 }}
            />
          </RouterLink>
          <Box sx={{ ml: "auto", gap: 2, display: "flex", alignItems: "center" }}>
            <LanguageSwitcher />
            {!isMobile && (
              <>
                <Button color="inherit" component={RouterLink} to="/companies">
                  {t('navigation.companies')}
                </Button>
                {isAuthenticated ? (
                  <Button color="inherit" component={RouterLink} to="/profile">
                    {t('navigation.profile')}
                  </Button>
                ) : (
                  <Button color="inherit" component={RouterLink} to="/login">
                    {t('navigation.login')}
                  </Button>
                )}
              </>
            )}
            <MobileMenu />
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, width: '100%' }}>
        {children}
      </Box>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.grey[200],
          width: '100%',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Expat. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 