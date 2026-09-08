import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/Common/SEO';
import type { MunicipalityId } from '@/types/onboarding';
import type { AnalyticsTimeframe } from '@/types/municipalAnalytics';
import { registerMunicipalAnalyticsTranslations } from '@/i18n/registerMunicipalAnalytics';
import { useMunicipalAnalytics } from '@/hooks/useMunicipalAnalytics';
import { KPICard } from '@/components/MunicipalAnalytics/KPICard';
import { IntegrationFunnel } from '@/components/MunicipalAnalytics/IntegrationFunnel';
import { TalentRadar } from '@/components/MunicipalAnalytics/TalentRadar';
import { DemographicsBreakdown } from '@/components/MunicipalAnalytics/DemographicsBreakdown';
import { SentimentInsights } from '@/components/MunicipalAnalytics/SentimentInsights';
import styles from './MunicipalDashboard.module.scss';

// Register translations bundle
registerMunicipalAnalyticsTranslations();

export const MunicipalDashboard: React.FC = () => {
  const { t } = useTranslation('analytics');
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const {
    selectedCity,
    timeframe,
    dataset,
    loading,
    setCity,
    setTimeframe,
    exportCSV,
    exportPrint,
  } = useMunicipalAnalytics('helsinki');

  const availableCities: Array<{ id: MunicipalityId; label: string }> = [
    { id: 'helsinki', label: 'Helsinki' },
    { id: 'espoo', label: 'Espoo' },
    { id: 'vantaa', label: 'Vantaa' },
    { id: 'tampere', label: 'Tampere' },
    { id: 'turku', label: 'Turku' },
    { id: 'oulu', label: 'Oulu' },
  ];

  const timeframesList: Array<{ id: AnalyticsTimeframe; labelKey: string }> = [
    { id: 'month', labelKey: 'timeframes.month' },
    { id: 'quarter', labelKey: 'timeframes.quarter' },
    { id: 'year', labelKey: 'timeframes.year' },
    { id: 'all', labelKey: 'timeframes.all' },
  ];

  return (
    <>
      <SEO
        title={`${t('title')} - Expat`}
        description={t('subtitle')}
        keywords="Finland municipal analytics, expat retention, talent mobility, Helsinki integration funnel, Tampere tech talent, Espoo foreign specialists, Oulu wireless engineers"
        url={currentUrl}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'DataFeed',
          name: t('title'),
          description: t('subtitle'),
          url: currentUrl,
        }}
      />

      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.badge}>
            <i className="pi pi-chart-line" />
            <span>B2G Municipal Intelligence & Retention</span>
          </div>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbarCard}>
          <div className={styles.selectorsGroup}>
            <div className={styles.cityButtonGroup}>
              {availableCities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  className={`${styles.cityBtn} ${selectedCity === city.id ? styles.active : ''}`}
                  onClick={() => setCity(city.id)}
                >
                  <i className="pi pi-map-marker" style={{ marginRight: '0.35rem' }} />
                  {city.label}
                </button>
              ))}
            </div>

            <div className={styles.timeframeGroup}>
              {timeframesList.map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  className={`${styles.timeframeBtn} ${timeframe === tf.id ? styles.active : ''}`}
                  onClick={() => setTimeframe(tf.id)}
                >
                  {t(tf.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actionsGroup}>
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.primary}`}
              onClick={exportCSV}
              title="Download raw dataset"
            >
              <i className="pi pi-file-excel" />
              {t('export_csv')}
            </button>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={exportPrint}
              title="Print official report"
            >
              <i className="pi pi-print" />
              {t('print_report')}
            </button>
          </div>
        </div>

        {loading || !dataset ? (
          <div className={styles.loadingSpinner}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2.5rem' }} />
          </div>
        ) : (
          <>
            {/* KPI Grid */}
            <div className={styles.kpiGrid}>
              <KPICard
                icon="pi pi-users"
                color="cyan"
                label={t('kpi.total_expats')}
                value={dataset.kpi.totalExpats.toLocaleString()}
                subtext={`Pop: ~${dataset.populationTotal.toLocaleString()}`}
              />
              <KPICard
                icon="pi pi-chart-line"
                color="green"
                label={t('kpi.monthly_growth')}
                value={`+${dataset.kpi.monthlyGrowthPercent}%`}
                trend={`+${dataset.kpi.monthlyGrowthPercent}%`}
                subtext="New registrations"
              />
              <KPICard
                icon="pi pi-compass"
                color="blue"
                label={t('kpi.avg_progress')}
                value={`${dataset.kpi.avgIntegrationProgress}%`}
                subtext="Onboarding completion"
              />
              <KPICard
                icon="pi pi-bolt"
                color="purple"
                label={t('kpi.specialists_rate')}
                value={`${dataset.kpi.specialistsRate}%`}
                subtext="Fast-Track & ICT"
              />
              <KPICard
                icon="pi pi-home"
                color="amber"
                label={t('kpi.families_rate')}
                value={`${dataset.kpi.familiesWithKidsPercent}%`}
                subtext="School/daycare age"
              />
              <KPICard
                icon="pi pi-heart"
                color="green"
                label={t('kpi.satisfaction')}
                value={`${dataset.kpi.satisfactionIndex} / 5.0`}
                subtext="Survey retention index"
              />
            </div>

            {/* Funnel & Bottlenecks */}
            <IntegrationFunnel funnelSteps={dataset.funnel} />

            {/* Talent Radar & Skills */}
            <TalentRadar skills={dataset.skills} />

            {/* Demographics & Origin */}
            <DemographicsBreakdown demographics={dataset.demographics} />

            {/* Sentiment & Citizen Voice */}
            <SentimentInsights sentiment={dataset.sentiment} />
          </>
        )}
      </div>
    </>
  );
};

export default MunicipalDashboard;
