import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/Common/SEO';
import Button from '../components/Common/Button';
import styles from './About.module.scss';

const About: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <>
      <SEO
        title={`${t('aboutPage.hero.title', 'About Expat Platform')} - ${t('app.title', 'Expat App')}`}
        description={t(
          'aboutPage.hero.subtitle',
          'The comprehensive civic-tech platform connecting international talent, innovative employers, and Finnish municipalities to accelerate integration and eliminate bureaucracy.'
        )}
        keywords="about expat platform, expat Finland, civic tech, integration Finland, jobs Finland, DVV, Vero, Kela, municipal services, Helsinki, Espoo, Tampere, Turku, Oulu"
        url={currentUrl}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: `${t('aboutPage.hero.title', 'About Expat Platform')} - ${t('app.title', 'Expat App')}`,
          description: t(
            'aboutPage.hero.subtitle',
            'The comprehensive civic-tech platform connecting international talent, innovative employers, and Finnish municipalities.'
          ),
          url: currentUrl,
        }}
      />

      <div className={styles.aboutWrapper}>
        {/* HERO SECTION */}
        <section className={styles.hero}>
          <div className={styles.pillBadge}>
            <span className={styles.dot} />
            <span>{t('aboutPage.badge', 'Civic-Tech Infrastructure • Finland First')}</span>
          </div>

          <h1 className={styles.heroTitle}>
            {t('aboutPage.hero.title', 'About Expat Platform')}
          </h1>

          <p className={styles.heroSubtitle}>
            {t(
              'aboutPage.hero.subtitle',
              'The comprehensive civic-tech platform connecting international talent, innovative employers, and Finnish municipalities to accelerate integration, eliminate bureaucracy, and foster economic growth.'
            )}
          </p>

          {/* Key Impact Metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={`${styles.metricValue} ${styles.cyan}`}>
                {t('aboutPage.metrics.talentDeficit', '20,000+')}
              </div>
              <div className={styles.metricLabel}>
                {t('aboutPage.metrics.talentDeficitLabel', 'Annual ICT & Tech Specialist Shortage in Finland')}
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={`${styles.metricValue} ${styles.lime}`}>
                {t('aboutPage.metrics.onboardingSpeed', '14 Days')}
              </div>
              <div className={styles.metricLabel}>
                {t('aboutPage.metrics.onboardingSpeedLabel', 'Target Settling & Relocation Time (vs. 6 Mo Baseline)')}
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={`${styles.metricValue} ${styles.purple}`}>
                {t('aboutPage.metrics.gdpPotential', '€3.2B')}
              </div>
              <div className={styles.metricLabel}>
                {t('aboutPage.metrics.gdpPotentialLabel', 'Unrealized GDP Unlocked via Talent Retention')}
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={`${styles.metricValue} ${styles.amber}`}>
                {t('aboutPage.metrics.taxContribution', '€25k – €35k')}
              </div>
              <div className={styles.metricLabel}>
                {t('aboutPage.metrics.taxContributionLabel', 'Annual Municipal Tax Yield per Retained Specialist')}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: WHAT THE APPLICATION DOES */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionBadge}>
              {t('aboutPage.mission.badge', 'Our Mission')}
            </span>
            <h2 className={styles.sectionTitle}>
              {t('aboutPage.mission.title', 'What Expat Platform Does')}
            </h2>
          </div>

          <div className={styles.missionCard}>
            <p>
              {t(
                'aboutPage.mission.description',
                'Finland offers world-class innovation, safety, and quality of life, yet international professionals face fragmented bureaucratic silos across registration, taxation, and housing. At the same time, Finnish tech leaders face an acute specialist shortage. Expat Platform eliminates friction by connecting talent, employers, and municipal governments into one seamless digital ecosystem.'
              )}
            </p>
          </div>

          <div className={styles.stakeholdersGrid}>
            <div className={styles.stakeholderCard}>
              <div className={`${styles.iconCircle} ${styles.cyan}`}>
                <i className="pi pi-user" />
              </div>
              <h3>{t('aboutPage.mission.talentCard.title', 'For International Specialists')}</h3>
              <p>
                {t(
                  'aboutPage.mission.talentCard.description',
                  'A single digital gateway for moving, settling, finding career opportunities, navigating public institutions (DVV, Vero, Kela), and actively participating in municipal democracy.'
                )}
              </p>
            </div>

            <div className={styles.stakeholderCard}>
              <div className={`${styles.iconCircle} ${styles.lime}`}>
                <i className="pi pi-building" />
              </div>
              <h3>{t('aboutPage.mission.companyCard.title', 'For Finnish Employers')}</h3>
              <p>
                {t(
                  'aboutPage.mission.companyCard.description',
                  'Direct connection to verified international specialists, culturally calibrated Nordic STAR resumes, and structured tools to reduce relocation friction and employee turnover.'
                )}
              </p>
            </div>

            <div className={styles.stakeholderCard}>
              <div className={`${styles.iconCircle} ${styles.purple}`}>
                <i className="pi pi-globe" />
              </div>
              <h3>{t('aboutPage.mission.municipalityCard.title', 'For Municipalities & Government')}</h3>
              <p>
                {t(
                  'aboutPage.mission.municipalityCard.description',
                  'Data-driven integration funnels, talent demographic intelligence, and automated public service request routing for forward-looking Finnish cities.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: WHAT WE OFFER TODAY */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={`${styles.sectionBadge} ${styles.lime}`}>
              {t('aboutPage.offerings.badge', 'Current Platform Capabilities')}
            </span>
            <h2 className={styles.sectionTitle}>
              {t('aboutPage.offerings.title', 'What We Offer Today')}
            </h2>
            <p className={styles.sectionSubtitle}>
              {t(
                'aboutPage.offerings.subtitle',
                'A fully functional civic-tech ecosystem with live production modules already serving the Finnish landscape.'
              )}
            </p>
          </div>

          <div className={styles.offeringsGrid}>
            {/* Offering 1 */}
            <div className={`${styles.offeringCard} ${styles.cardCyan}`}>
              <div className={styles.offeringTop}>
                <div className={`${styles.iconCircle} ${styles.cyan}`}>
                  <i className="pi pi-compass" />
                </div>
                <span className={styles.liveTag}>
                  <span className={styles.liveDot} />
                  Live Module
                </span>
              </div>
              <h3 className={styles.offeringTitle}>
                {t('aboutPage.offerings.onboarding.title', 'Civic Onboarding & Relocation Guide')}
              </h3>
              <p className={styles.offeringDesc}>
                {t(
                  'aboutPage.offerings.onboarding.description',
                  'Dynamic, city-tailored relocation checklists spanning 4 essential phases: from pre-arrival planning to long-term integration. Step-by-step guidance for DVV, Vero tax cards, Kela social insurance, bank accounts, healthcare, and schooling.'
                )}
              </p>
              <button
                type="button"
                className={styles.offeringAction}
                onClick={() => navigate('/onboarding')}
              >
                <span>{t('navigation.onboarding', 'Relocation Guide')}</span>
                <i className="pi pi-arrow-right" />
              </button>
            </div>

            {/* Offering 2 */}
            <div className={`${styles.offeringCard} ${styles.cardLime}`}>
              <div className={styles.offeringTop}>
                <div className={`${styles.iconCircle} ${styles.lime}`}>
                  <i className="pi pi-briefcase" />
                </div>
                <span className={styles.liveTag}>
                  <span className={styles.liveDot} />
                  Live Module
                </span>
              </div>
              <h3 className={styles.offeringTitle}>
                {t('aboutPage.offerings.careers.title', 'Career & Talent Matching')}
              </h3>
              <p className={styles.offeringDesc}>
                {t(
                  'aboutPage.offerings.careers.description',
                  'Curated directory of expat-friendly employers, tech stack filtering, English-speaking workplace cultures, and our Nordic STAR Resume Builder calibrated specifically to Nordic hiring standards.'
                )}
              </p>
              <button
                type="button"
                className={styles.offeringAction}
                onClick={() => navigate('/companies')}
              >
                <span>{t('navigation.companies', 'Browse Companies')}</span>
                <i className="pi pi-arrow-right" />
              </button>
            </div>

            {/* Offering 3 */}
            <div className={`${styles.offeringCard} ${styles.cardPurple}`}>
              <div className={styles.offeringTop}>
                <div className={`${styles.iconCircle} ${styles.purple}`}>
                  <i className="pi pi-users" />
                </div>
                <span className={styles.liveTag}>
                  <span className={styles.liveDot} />
                  Live Module
                </span>
              </div>
              <h3 className={styles.offeringTitle}>
                {t('aboutPage.offerings.civic.title', 'Civic Engagement & Participatory Budgeting')}
              </h3>
              <p className={styles.offeringDesc}>
                {t(
                  'aboutPage.offerings.civic.description',
                  'Direct democratic inclusion via participatory budgeting (Osallistuva budjetointi) with virtual token voting, municipal sentiment polls, language exchange cafes, and mentorship.'
                )}
              </p>
              <button
                type="button"
                className={styles.offeringAction}
                onClick={() => navigate('/participatory-budget')}
              >
                <span>{t('navigation.participatoryBudget', 'City Budget Voting')}</span>
                <i className="pi pi-arrow-right" />
              </button>
            </div>

            {/* Offering 4 */}
            <div className={`${styles.offeringCard} ${styles.cardAmber}`}>
              <div className={styles.offeringTop}>
                <div className={`${styles.iconCircle} ${styles.amber}`}>
                  <i className="pi pi-chart-bar" />
                </div>
                <span className={styles.liveTag}>
                  <span className={styles.liveDot} />
                  Live Module
                </span>
              </div>
              <h3 className={styles.offeringTitle}>
                {t('aboutPage.offerings.analytics.title', 'Municipal Requests & B2G Analytics')}
              </h3>
              <p className={styles.offeringDesc}>
                {t(
                  'aboutPage.offerings.analytics.description',
                  'A direct ticketing channel for citizens to contact municipal departments, combined with high-level analytics dashboards for city councils to monitor integration velocity and talent sentiment.'
                )}
              </p>
              <button
                type="button"
                className={styles.offeringAction}
                onClick={() => navigate('/service-requests')}
              >
                <span>{t('navigation.serviceRequests', 'Service Requests')}</span>
                <i className="pi pi-arrow-right" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 3: WHAT WE WILL DO (ROADMAP) */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={`${styles.sectionBadge} ${styles.purple}`}>
              {t('aboutPage.roadmap.badge', 'Product Roadmap')}
            </span>
            <h2 className={styles.sectionTitle}>
              {t('aboutPage.roadmap.title', 'What We Will Do Next')}
            </h2>
            <p className={styles.sectionSubtitle}>
              {t(
                'aboutPage.roadmap.subtitle',
                'Our strategic expansion plan: securing the Finnish ecosystem before scaling internationally.'
              )}
            </p>
          </div>

          <div className={styles.roadmapGrid}>
            {/* Step 1 */}
            <div className={`${styles.roadmapStep} ${styles.activeStep}`}>
              <div className={styles.stepHeader}>
                <span className={styles.stepPhase}>
                  {t('aboutPage.roadmap.phase1.phase', 'Phase 1 • Q1-Q2 2026')}
                </span>
                <span className={`${styles.statusTag} ${styles.active}`}>Active</span>
              </div>
              <h3 className={styles.stepTitle}>
                {t('aboutPage.roadmap.phase1.title', 'Suomi.fi & Public Register Deep Sync')}
              </h3>
              <p className={styles.stepDesc}>
                {t(
                  'aboutPage.roadmap.phase1.description',
                  'Direct integration with Suomi.fi-tunnistus (Finnish Bank ID / Mobile ID) for automated digital identity verification, plus automated Vero tax card calculation and DVV address sync.'
                )}
              </p>
            </div>

            {/* Step 2 */}
            <div className={styles.roadmapStep}>
              <div className={styles.stepHeader}>
                <span className={styles.stepPhase}>
                  {t('aboutPage.roadmap.phase2.phase', 'Phase 2 • Q2-Q3 2026')}
                </span>
                <span className={`${styles.statusTag} ${styles.planned}`}>Planned</span>
              </div>
              <h3 className={styles.stepTitle}>
                {t('aboutPage.roadmap.phase2.title', 'AI Legal & Integration Copilot')}
              </h3>
              <p className={styles.stepDesc}>
                {t(
                  'aboutPage.roadmap.phase2.description',
                  'A specialized RAG-powered AI advisor trained on Finnish labor laws, collective agreements (TES), and tenancy regulations to provide 24/7 legal guidance in expats\' native languages.'
                )}
              </p>
            </div>

            {/* Step 3 */}
            <div className={styles.roadmapStep}>
              <div className={styles.stepHeader}>
                <span className={styles.stepPhase}>
                  {t('aboutPage.roadmap.phase3.phase', 'Phase 3 • Q3-Q4 2026')}
                </span>
                <span className={`${styles.statusTag} ${styles.planned}`}>Planned</span>
              </div>
              <h3 className={styles.stepTitle}>
                {t('aboutPage.roadmap.phase3.title', 'Nationwide B2B Employer Portal')}
              </h3>
              <p className={styles.stepDesc}>
                {t(
                  'aboutPage.roadmap.phase3.description',
                  'A complete enterprise dashboard for Finnish companies to manage international relocations, track visa progress, and collaborate seamlessly with municipal integration houses.'
                )}
              </p>
            </div>

            {/* Step 4 */}
            <div className={styles.roadmapStep}>
              <div className={styles.stepHeader}>
                <span className={styles.stepPhase}>
                  {t('aboutPage.roadmap.phase4.phase', 'Phase 4 • 2027+')}
                </span>
                <span className={`${styles.statusTag} ${styles.vision}`}>Vision</span>
              </div>
              <h3 className={styles.stepTitle}>
                {t('aboutPage.roadmap.phase4.title', 'Pan-European Civic Export')}
              </h3>
              <p className={styles.stepDesc}>
                {t(
                  'aboutPage.roadmap.phase4.description',
                  'Adapting and scaling our proven Finnish civic-tech blueprint to Sweden, Germany, Estonia, and across the EU under European interoperability and digital governance standards.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: STRATEGIC PERSPECTIVES & IMPACT */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={`${styles.sectionBadge} ${styles.amber}`}>
              {t('aboutPage.vision.badge', 'Strategic Perspectives')}
            </span>
            <h2 className={styles.sectionTitle}>
              {t('aboutPage.vision.title', 'Long-Term Vision & Impact')}
            </h2>
            <p className={styles.sectionSubtitle}>
              {t(
                'aboutPage.vision.subtitle',
                'Solving structural challenges today to build resilient, innovative societies for tomorrow.'
              )}
            </p>
          </div>

          <div className={styles.visionGrid}>
            <div className={styles.visionCard}>
              <h3>{t('aboutPage.vision.point1.title', 'Closing the National Talent Deficit')}</h3>
              <p>
                {t(
                  'aboutPage.vision.point1.description',
                  'Ensuring Finland\'s economic vitality and tech leadership by transforming talent attraction from an administrative hurdle into a competitive national advantage.'
                )}
              </p>
            </div>

            <div className={styles.visionCard}>
              <h3>{t('aboutPage.vision.point2.title', 'Sustainable Integration & High-Trust Inclusion')}</h3>
              <p>
                {t(
                  'aboutPage.vision.point2.description',
                  'Lowering expat turnover, accelerating social belonging, and ensuring international specialists build fulfilling, long-term lives in Finnish communities.'
                )}
              </p>
            </div>

            <div className={styles.visionCard}>
              <h3>{t('aboutPage.vision.point3.title', 'A Prime European Civic-Tech Standard')}</h3>
              <p>
                {t(
                  'aboutPage.vision.point3.description',
                  'Proving our model in Europe\'s most digitally mature public sector to create an exportable standard for municipal digital integration across the continent.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: TEAM & FOUNDATIONS */}
        <section className={styles.section}>
          <div className={styles.teamCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>
                {t('aboutPage.team.badge', 'Leadership & Foundations')}
              </span>
              <h2 className={styles.sectionTitle}>
                {t('aboutPage.team.title', 'Built with Vision & Technical Rigor')}
              </h2>
            </div>

            <p className={styles.teamIntro}>
              {t(
                'aboutPage.team.description',
                'Expat was created by engineers and civic-tech leaders dedicated to making Finland the world\'s most accessible, welcoming, and productive destination for global talent.'
              )}
            </p>

            <div className={styles.teamGrid}>
              <div className={styles.memberBox}>
                <div className={styles.avatarCircle}>SE</div>
                <h4 className={styles.memberName}>{t('aboutPage.team.stan.name', 'Stan Efimov')}</h4>
                <span className={styles.memberRole}>
                  {t('aboutPage.team.stan.role', 'Co-Founder & Engineering Lead')}
                </span>
              </div>

              <div className={styles.memberBox}>
                <div className={styles.avatarCircle}>VB</div>
                <h4 className={styles.memberName}>{t('aboutPage.team.vitaly.name', 'Vitaly Brazhnikov')}</h4>
                <span className={styles.memberRole}>
                  {t('aboutPage.team.vitaly.role', 'Co-Founder & System Architect')}
                </span>
              </div>

              <div className={styles.memberBox}>
                <div className={styles.avatarCircle}>JB</div>
                <h4 className={styles.memberName}>{t('aboutPage.team.jens.name', 'Jens Brännback')}</h4>
                <span className={styles.memberRole}>
                  {t('aboutPage.team.jens.role', 'Chief Executive Officer')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: CALL TO ACTION BANNER */}
        <div className={styles.ctaCard}>
          <h2>{t('aboutPage.cta.title', 'Ready to Explore the Platform?')}</h2>
          <p>
            {t(
              'aboutPage.cta.subtitle',
              'Discover our active modules, explore relocation guides, and connect with expat-friendly employers across Finland.'
            )}
          </p>

          <div className={styles.ctaActions}>
            <Button
              label={t('aboutPage.cta.guideBtn', 'Relocation Guide')}
              icon="pi pi-compass"
              className={styles.ctaBtnPrimary}
              onClick={() => navigate('/onboarding')}
            />
            <Button
              label={t('aboutPage.cta.companiesBtn', 'Explore Companies')}
              icon="pi pi-building"
              variant="outlined"
              className={styles.ctaBtnSecondary}
              onClick={() => navigate('/companies')}
            />
            <Button
              label={t('aboutPage.cta.communityBtn', 'Join Community')}
              icon="pi pi-users"
              variant="text"
              onClick={() => navigate('/community')}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
