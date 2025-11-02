import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isTokenValid } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsAuthenticated(isTokenValid());
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 16px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '16px' }}>{t('home.welcome')}</h1>
      <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '32px' }}>
        {t('home.description')}
      </p>
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
        {isAuthenticated ? (
          <Button label={t('navigation.companies')} onClick={() => navigate('/companies')} style={{ width: '200px' }} />
        ) : (
          <Button label={t('navigation.login')} onClick={() => navigate('/login')} style={{ width: '200px' }} />
        )}
      </div>
    </div>
  );
};

export default Home; 