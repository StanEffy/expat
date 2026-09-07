import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@/components/Common/Button';
import SEO from '@/components/Common/SEO';
import styles from './NotFound.module.scss';

export const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <SEO
        title={`404 - ${t('app.title')}`}
        description="Page not found"
        noindex={true}
      />
      <div className={styles.container}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>{t('common.notFoundTitle', 'Page Not Found')}</h2>
        <p className={styles.description}>
          {t(
            'common.notFoundDescription',
            'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
          )}
        </p>
        <Button
          label={t('navigation.home', 'Go to Homepage')}
          icon="pi pi-home"
          onClick={() => navigate('/')}
          className={styles.button}
        />
      </div>
    </>
  );
};

export default NotFound;
