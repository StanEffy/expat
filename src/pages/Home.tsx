import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { isTokenValid } from '../utils/auth';
import SEO from '../components/Common/SEO';
import FlapText from '../components/Decorative/FlapText';
import styles from './Home.module.scss';

const Arrow = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// Pictograms in the style of trail signs
const RockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 32 L10 18 L18 12 L28 14 L36 24 L38 32 Z" />
    <path d="M10 18 L20 22 L18 12 M20 22 L28 14 M20 22 L30 32" />
  </svg>
);

const SheetIcon = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 4 H25 L32 11 V36 H9 Z" />
    <path d="M25 4 V11 H32 M14 18 H27 M14 24 H27 M14 30 H22" />
  </svg>
);

const ClockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="20" cy="21" r="14" />
    <path d="M20 12 V21 L26 25 M16 4 H24" strokeLinecap="square" />
  </svg>
);

const BirchIcon = () => (
  <svg width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="10" y="4" width="7" height="32" />
    <rect x="24" y="9" width="7" height="27" />
    <path d="M10 12 H14 M13 20 H17 M10 28 H15 M24 16 H29 M27 24 H31 M24 31 H28" strokeWidth="2.4" />
  </svg>
);

/**
 * The Finnish summer internship season (kesäharjoittelu), as a departures board.
 * Big employers open applications in January, so the board stays useful all year.
 */
const SEASON = [
  { code: 'TAMMI', key: 'jan', months: [1], label: '01' },
  { code: 'HELMI', key: 'feb', months: [2], label: '02' },
  { code: 'KEVÄT', key: 'spring', months: [3, 4, 5], label: '03–05' },
  { code: 'KESÄ', key: 'summer', months: [6, 7, 8], label: '06–08' },
] as const;

const seasonMarker = (): { index: number; kind: 'now' | 'soon' } => {
  const month = new Date().getMonth() + 1;
  const index = SEASON.findIndex((step) => (step.months as readonly number[]).includes(month));
  // September to December: the next season opens in January
  return index >= 0 ? { index, kind: 'now' } : { index: 0, kind: 'soon' };
};

const SECTIONS: { key: 'industries' | 'resume' | 'deadlines' | 'kipina'; to: string; icon: ReactNode; isNew?: boolean }[] = [
  { key: 'industries', to: '/categories', icon: <RockIcon /> },
  { key: 'resume', to: '/profile/resume-builder', icon: <SheetIcon /> },
  { key: 'deadlines', to: '/deadlines', icon: <ClockIcon /> },
  // the startup side lives next door
  { key: 'kipina', to: '/kipina', icon: <BirchIcon />, isNew: true },
];

// Headline words rise one by one out of their own line
const Headline = ({ text }: { text: string }) => {
  const words = text.split(' ');
  return (
    <h1 className={styles.title}>
      {words.map((word, i) => (
        <span key={i}>
          <span className={styles.word}>
            <span className={styles.wordInner} style={{ '--w': i } as CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </h1>
  );
};

/** Home of the Expat side: finding a company for an internship or a first job. */
const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [query, setQuery] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const marker = seasonMarker();

  useEffect(() => {
    setIsAuthenticated(isTokenValid());
  }, []);

  const search = (event: FormEvent) => {
    event.preventDefault();
    const name = query.trim();
    navigate(name ? `/companies?name=${encodeURIComponent(name)}` : '/companies');
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <>
      <SEO
        title={`${t('app.title')} - ${t('home.welcome')}`}
        description={t('home.description')}
        keywords="Finland, internship, harjoittelu, kesätyö, summer job, student jobs, companies, Helsinki, work in Finland"
        url={baseUrl ? `${baseUrl}/expat` : '/expat'}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: t('app.title'),
          description: t('home.description'),
          url: `${baseUrl}/expat`,
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
            <p className="mono-label" data-reveal>{t('home.eyebrow')}</p>
            <Headline text={t('home.headline')} />
            <p className={styles.lead} data-reveal>{t('home.lead')}</p>

            <form className={styles.search} onSubmit={search} role="search" data-reveal>
              <label htmlFor="home-company-search" className={styles.searchLabel}>
                {t('home.searchLabel')}
              </label>
              <div className={styles.searchRow}>
                <input
                  id="home-company-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('home.searchPlaceholder')}
                  className={styles.searchInput}
                  autoComplete="off"
                />
                <button type="submit" className={styles.searchButton}>
                  {t('home.searchButton')}
                  <Arrow />
                </button>
              </div>
            </form>

            <div className={styles.buttons} data-reveal>
              <Link to="/companies" className={styles.secondary}>{t('home.browseAll')}</Link>
              {isAuthenticated ? (
                <Link to="/profile/resume-builder" className={styles.secondary}>{t('home.ctaResume')}</Link>
              ) : (
                <Link to="/login" className={styles.secondary}>{t('navigation.login')}</Link>
              )}
            </div>
          </section>

          <aside className={styles.board} aria-label={t('home.boardLabel')} data-reveal>
            <div className={styles.boardHead}>
              <span>{t('home.boardLabel')}</span>
              <span>{t('home.boardMonth')}</span>
            </div>
            <ol className={styles.boardList}>
              {SEASON.map((step, i) => {
                const marked = i === marker.index;
                return (
                  <li key={step.key} className={`${styles.boardRow} ${marked ? styles.boardRowMarked : ''}`}>
                    <span>
                      <FlapText text={step.code} delay={500 + i * 220} className={styles.code} />
                      {t(`home.season.${step.key}`)}
                    </span>
                    {marked ? (
                      <span className={styles.boardMarker}>{t(`home.board_${marker.kind}`)}</span>
                    ) : (
                      <span className={styles.stepNo}>{step.label}</span>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className={styles.boardNote}>{t('home.boardNote')}</p>
          </aside>
        </div>

        <nav className={styles.sections} aria-label={t('home.sectionsLabel')}>
          {SECTIONS.map((section, i) => (
            <Link key={section.key} to={section.to} className={styles.sectionRow} data-reveal="wipe">
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
