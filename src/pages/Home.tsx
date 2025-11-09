import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isTokenValid } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/Common/SEO';
import styles from './Home.module.scss';

const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsAuthenticated(isTokenValid());
  }, []);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <>
      <SEO
        title={`${t('app.title')} - ${t('home.welcome')}`}
        description={t('home.description')}
        keywords="Finland, expat, job opportunities, companies, careers, Helsinki, Finnish companies, employment, expat jobs, work in Finland"
        url={baseUrl ? `${baseUrl}/` : '/'}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: t('app.title'),
          description: t('home.description'),
          url: `${baseUrl}/`,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
          },
        }}
      />
      <div className={styles.container}>
      <h1 className={styles.title}>{t('home.welcome')}</h1>
      <p className={styles.description}>
        {t('home.description')}
      </p>
      <div className={styles.buttons}>
        {isAuthenticated ? (
          <Button label={t('navigation.companies')} onClick={() => navigate('/companies')} className={styles.button} />
        ) : (
          <Button label={t('navigation.login')} onClick={() => navigate('/login')} className={styles.button} />
        )}
      </div>
    </div>
    </>
  );
};

export default Home; 