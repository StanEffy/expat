import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/Common/SEO';
import FlapText from '../components/Decorative/FlapText';
import { KipinaMark } from '../components/Header/KipinaLogo';
import { TOGETHER_LINKS } from '../components/Growth/togetherLinks';
import { registerGrowthTranslations } from '../i18n/registerGrowth';
import styles from './Home.module.scss';
import own from './KipinaHome.module.scss';

registerGrowthTranslations();

const Arrow = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// From an idea to a registered venture, as a departures board
const BOARD_STEPS = [
  { code: 'IDEA', key: 'idea' },
  { code: 'TEAM', key: 'team' },
  { code: 'MEET', key: 'meet' },
  { code: 'PRH', key: 'prh' },
] as const;

/** Home of Kipinä, the startup side: co-founders, people and ventures. */
const KipinaHome = () => {
  const { t } = useTranslation();
  const { t: tg } = useTranslation('growth');
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    registerGrowthTranslations();
  }, []);

  return (
    <>
      <SEO
        title={`KIPINÄ — ${t('sides.kipina.tagline')}`}
        description={t('sides.kipinaHome.lead')}
        keywords="Finland, startup, co-founder, team, expat, entrepreneurship"
        url={baseUrl ? `${baseUrl}/kipina` : '/kipina'}
      />
      <div className={styles.container}>
        <div className={styles.hero}>
          <section className={styles.intro}>
            <p className="mono-label" data-reveal>{t('sides.kipinaHome.eyebrow')}</p>
            <h1 className={styles.title} data-reveal>{t('sides.kipinaHome.title')}</h1>
            <p className={styles.lead} data-reveal>{t('sides.kipinaHome.lead')}</p>
            <div className={styles.buttons} data-reveal>
              <Link to="/cooperate" className={styles.cta}>
                {t('sides.kipinaHome.cta')}
                <Arrow />
              </Link>
              <Link to="/ventures" className={styles.secondary}>{t('sides.kipinaHome.ctaSecondary')}</Link>
            </div>
          </section>

          <aside className={styles.board} aria-label={t('sides.kipinaHome.boardLabel')} data-reveal>
            <div className={own.sparkRow} aria-hidden="true">
              <KipinaMark breathing className={own.bigMark} />
            </div>
            <div className={styles.boardHead}>
              <span>{t('sides.kipinaHome.boardLabel')}</span>
              <span>{t('home.boardColumn')}</span>
            </div>
            <ol className={styles.boardList}>
              {BOARD_STEPS.map((step, i) => (
                <li key={step.key} className={styles.boardRow}>
                  <span>
                    <FlapText text={step.code} delay={500 + i * 220} className={styles.code} />
                    {t(`sides.kipinaHome.steps.${step.key}`)}
                  </span>
                  <span className={styles.stepNo}>{String(i + 1).padStart(2, '0')}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <nav className={styles.sections} aria-label={t('home.sectionsLabel')}>
          {TOGETHER_LINKS.map((link, i) => (
            <Link key={link.to} to={link.to} className={styles.sectionRow} data-reveal="wipe">
              <span className={styles.sectionNo}>
                <i className={`${link.icon} ${own.rowIcon}`} aria-hidden="true" />
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={styles.sectionTitle}>{tg(`together.items.${link.key}.title`)}</span>
              <span className={styles.sectionText}>{tg(`together.items.${link.key}.text`)}</span>
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

export default KipinaHome;
