import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/Common/SEO';
import AnimatedLogo from '../components/Header/AnimatedLogo';
import { Spark } from '../components/Header/KipinaLogo';
import { SIDE_HOME, rememberSide, type Side } from '../components/Sides/sides';
import styles from './Gateway.module.scss';

const Arrow = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const SIDES: Side[] = ['expat', 'kipina'];

/** The fork in the road: pick the job side or the startup side. */
const Gateway = () => {
  const { t } = useTranslation();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <>
      <SEO
        title={t('app.title')}
        description={t('sides.gateway.lead')}
        keywords="Finland, internship, students, jobs, startup, co-founder, expat"
        url={baseUrl ? `${baseUrl}/` : '/'}
      />
      <div className={styles.container}>
        <header className={styles.head}>
          <p className="mono-label" data-reveal>{t('sides.gateway.eyebrow')}</p>
          <h1 className={styles.title} data-reveal>{t('sides.gateway.title')}</h1>
          <p className={styles.lead} data-reveal>{t('sides.gateway.lead')}</p>
        </header>

        <div className={styles.badges}>
          {SIDES.map((side, i) => {
            const points = t(`sides.${side}.points`, { returnObjects: true });
            return (
              <Link
                key={side}
                to={SIDE_HOME[side]}
                onClick={() => rememberSide(side)}
                className={`${styles.badge} ${styles[side]}`}
                data-reveal
              >
                <span className={styles.badgeTop}>
                  <span className={styles.badgeNo}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.audience}>{t(`sides.${side}.audience`)}</span>
                </span>
                <span className={styles.mark}>
                  {side === 'expat' ? (
                    <AnimatedLogo />
                  ) : (
                    <span className={`${styles.kipinaMark} notranslate`} translate="no" lang="fi">
                      <Spark className={styles.spark} />
                      KIPINÄ
                    </span>
                  )}
                </span>
                <span className={styles.tagline}>{t(`sides.${side}.tagline`)}</span>
                {Array.isArray(points) && (
                  <ul className={styles.points}>
                    {(points as string[]).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
                <span className={styles.cta}>
                  {t(`sides.${side}.cta`)}
                  <Arrow />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Gateway;
