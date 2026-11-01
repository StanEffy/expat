import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { isTokenValid } from '../utils/auth';
import SEO from '../components/Common/SEO';
import styles from './Home.module.scss';

const Arrow = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// Pictograms in the style of trail signs: rock, lake, birches
const RockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 32 L10 18 L18 12 L28 14 L36 24 L38 32 Z" />
    <path d="M10 18 L20 22 L18 12 M20 22 L28 14 M20 22 L30 32" />
  </svg>
);

const LakeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 22 C6 14 16 10 24 12 C32 14 36 20 32 26 C28 32 14 32 9 28 C7 26 6 24 6 22 Z" />
    <path d="M13 21 H23 M17 25 H26" />
  </svg>
);

const BirchIcon = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="10" y="4" width="7" height="32" />
    <rect x="24" y="9" width="7" height="27" />
    <path d="M10 12 H14 M13 20 H17 M10 28 H15 M24 16 H29 M27 24 H31 M24 31 H28" strokeWidth="2.4" />
  </svg>
);

const BOARD_STEPS = [
  { code: 'DVV', key: 'dvv' },
  { code: 'VERO', key: 'vero' },
  { code: 'PANKKI', key: 'bank' },
  { code: 'KELA', key: 'kela' },
] as const;

const SECTIONS: { key: 'work' | 'city' | 'together'; to: string; icon: ReactNode; isNew?: boolean }[] = [
  { key: 'work', to: '/companies', icon: <RockIcon /> },
  { key: 'city', to: '/service-requests', icon: <LakeIcon /> },
  { key: 'together', to: '/together', icon: <BirchIcon />, isNew: true },
];

const Home = () => {
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
        <div className={styles.hero}>
          <section className={styles.intro}>
            <p className="mono-label">{t('home.eyebrow')}</p>
            <h1 className={styles.title}>{t('home.headline')}</h1>
            <p className={styles.lead}>{t('home.lead')}</p>
            <div className={styles.buttons}>
              <Link to="/onboarding" className={styles.cta}>
                {t('home.ctaPlan')}
                <Arrow />
              </Link>
              {isAuthenticated ? (
                <Link to="/companies" className={styles.secondary}>{t('home.ctaWork')}</Link>
              ) : (
                <Link to="/login" className={styles.secondary}>{t('navigation.login')}</Link>
              )}
            </div>
          </section>

          <aside className={styles.board} aria-label={t('home.boardLabel')}>
            <svg className={styles.map} viewBox="0 0 400 150" aria-hidden="true">
              <g fill="none" stroke="#4A5058" strokeWidth="1.5">
                <path d="M60 80 C60 40 130 25 190 35 C250 45 330 30 350 70 C370 110 300 130 230 120 C170 112 110 135 80 115 C65 105 60 95 60 80 Z" />
                <path d="M95 80 C95 55 140 48 190 55 C240 62 305 52 318 75 C330 98 280 108 230 102 C180 96 130 112 108 98 C99 92 95 87 95 80 Z" />
              </g>
              <path
                d="M130 80 C130 68 160 64 192 70 C226 76 282 70 288 82 C294 94 258 92 228 90 C196 88 160 96 142 90 C134 87 130 84 130 80 Z"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              />
              <path d="M248 78 C254 72 266 74 268 80 C270 86 258 89 250 87 C245 86 244 82 248 78 Z" fill="#4A5058" />
              <circle cx="40" cy="36" r="6" fill="var(--accent)" />
              <text x="54" y="40" className={styles.mapText}>{t('home.youAreHere')}</text>
              <text x="300" y="140" className={`${styles.mapText} notranslate`}>JÄRVI</text>
            </svg>
            <div className={styles.boardHead}>
              <span>{t('home.boardLabel')}</span>
              <span>{t('home.boardColumn')}</span>
            </div>
            <ol className={styles.boardList}>
              {BOARD_STEPS.map((step, i) => (
                <li key={step.key} className={styles.boardRow}>
                  <span>
                    <span className={styles.code} translate="no">{step.code}</span>
                    {t(`home.steps.${step.key}`)}
                  </span>
                  <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <nav className={styles.sections} aria-label={t('home.sectionsLabel')}>
          {SECTIONS.map((section, i) => (
            <Link key={section.key} to={section.to} className={styles.sectionRow}>
              <span className={styles.sectionNo}>
                {section.icon}
                {String(i + 2).padStart(2, '0')}
              </span>
              <span className={styles.sectionTitle}>
                {t(`home.sections.${section.key}.title`)}
                {section.isNew && <span className={styles.badge}>{t('home.newBadge')}</span>}
              </span>
              <span className={styles.sectionText}>{t(`home.sections.${section.key}.text`)}</span>
              <span className={styles.sectionArrow}>
                <Arrow size={28} />
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Home;
