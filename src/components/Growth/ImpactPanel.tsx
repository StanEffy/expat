import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { impactService } from '@/services/growthService';
import { registerOnboardingTranslations } from '@/i18n/registerOnboarding';
import type { ConnectionSource, ImpactReport, IntegrationDimension } from '@/types/growth';
import { formatDate, percent } from './shared';
import styles from './Growth.module.scss';

const DIMENSIONS: IntegrationDimension[] = ['psychological', 'social', 'linguistic', 'navigational', 'political', 'economic'];
const SOURCES: ConnectionSource[] = ['event', 'high_five', 'coop', 'tandem', 'timebank', 'challenge'];

interface Props {
  /** '' for all cities */
  municipality: string;
}

/** Anonymous, aggregated outcomes from live data (groups under 10 people are hidden). */
export const ImpactPanel: React.FC<Props> = ({ municipality }) => {
  const { t, i18n } = useTranslation('growth');
  const { t: tOnboarding } = useTranslation('onboarding');
  const [report, setReport] = useState<ImpactReport | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    registerOnboardingTranslations();
    setError(false);
    impactService.report(municipality).then(setReport).catch(() => setError(true));
  }, [municipality]);

  if (error) {
    return <div className={`${styles.card} ${styles.emptyState}`}><i className="pi pi-exclamation-circle" />{t('common.loadError', 'Could not load this page. Please try again later.')}</div>;
  }
  if (!report) {
    return <div className={`${styles.card} ${styles.emptyState}`}><i className="pi pi-spin pi-spinner" /></div>;
  }

  const hidden = t('impact.hidden', { count: report.min_group_size });
  const { integration, network, ventures, community } = report;
  const maxWay = Math.max(1, ...SOURCES.map((s) => network.connections_by_way[s] ?? 0));

  return (
    <div>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}><i className="pi pi-map" /> {t('impact.integrationTitle', 'Integration (IPL-12 index)')}</h2>
        <p className={styles.cardSubtitle}>
          {t('impact.respondents', { count: integration.respondents })}
          {integration.repeat_respondents > 0 && ` · ${t('impact.repeat', { count: integration.repeat_respondents })}`}
        </p>
        <div className={styles.stats} style={{ marginBottom: '1.1rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{integration.avg_ipl === null ? '—' : Math.round(integration.avg_ipl * 100)}</div>
            <div className={styles.statLabel}>{t('impact.avgIpl', 'Average index, 0–100')}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{percent(integration.stay_likely_share)}</div>
            <div className={styles.statLabel}>{t('impact.stayLikely', 'Likely to stay in Finland 2+ years')}</div>
          </div>
        </div>
        <div className={styles.bars}>
          {DIMENSIONS.map((d) => {
            const value = integration.dimensions[d];
            const delta = integration.dimension_change[d];
            return (
              <div key={d} className={styles.barRow}>
                <span>{t(`integration.dimensions.${d}`)}</span>
                <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${(value ?? 0) * 100}%` }} /></div>
                <span className={styles.barValue} title={value === null ? hidden : undefined}>
                  {value === null ? '—' : Math.round(value * 100)}
                  {delta !== null && delta !== undefined && delta !== 0 && (
                    <small style={{ color: delta > 0 ? 'var(--positive)' : 'var(--warning)' }}> {delta > 0 ? '+' : ''}{Math.round(delta * 100)}</small>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        {integration.respondents < report.min_group_size && <p className={styles.notice}>{hidden}</p>}
      </div>

      <div className={styles.grid} style={{ marginTop: '1.25rem' }}>
        <div className={styles.card} style={{ marginTop: 0 }}>
          <h2 className={styles.cardTitle}><i className="pi pi-share-alt" /> {t('impact.networkTitle', 'People graph')}</h2>
          <div className={styles.stats} style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <div className={styles.stat}><div className={styles.statValue}>{network.connected_users}</div><div className={styles.statLabel}>{t('impact.connectedUsers', 'People with at least one real-world tie')}</div></div>
            <div className={styles.stat}><div className={styles.statValue}>{network.connections}</div><div className={styles.statLabel}>{t('impact.connections', 'Ties made')}</div></div>
            <div className={styles.stat}><div className={styles.statValue}>{network.avg_connections}</div><div className={styles.statLabel}>{t('impact.avgConnections', 'Ties per connected person')}</div></div>
            <div className={styles.stat}><div className={styles.statValue}>{percent(network.bridging_share)}</div><div className={styles.statLabel}>{t('impact.bridging', 'Bridging ties (link separate circles)')}</div></div>
          </div>
          <div className={styles.bars} style={{ marginTop: '1rem' }}>
            {SOURCES.map((s) => (
              <div key={s} className={styles.barRow}>
                <span>{t(`network.sources.${s}`)}</span>
                <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${((network.connections_by_way[s] ?? 0) / maxWay) * 100}%` }} /></div>
                <span className={styles.barValue}>{network.connections_by_way[s] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card} style={{ marginTop: 0 }}>
          <h2 className={styles.cardTitle}><i className="pi pi-briefcase" /> {t('impact.venturesTitle', 'Ventures (verified in the Trade Register)')}</h2>
          <div className={styles.stats} style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            <div className={styles.stat}><div className={styles.statValue}>{ventures.verified}</div><div className={styles.statLabel}>{t('impact.verified', 'Companies of members')}</div></div>
            <div className={styles.stat}><div className={styles.statValue}>{ventures.met_on_platform}</div><div className={styles.statLabel}>{t('impact.metOnPlatform', 'Teams formed on EXPAT')}</div></div>
            <div className={styles.stat}><div className={styles.statValue}>{ventures.active}</div><div className={styles.statLabel}>{t('impact.active', 'Active today')}</div></div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{percent(ventures.one_year_survival)}</div>
              <div className={styles.statLabel}>{t('impact.survival', { count: ventures.one_year_survival_of })}</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: '1.25rem' }}>
        <h2 className={styles.cardTitle}><i className="pi pi-heart" /> {t('impact.communityTitle', 'Community activity')}</h2>
        <div className={styles.stats}>
          <div className={styles.stat}><div className={styles.statValue}>{community.event_attendees}</div><div className={styles.statLabel}>{t('impact.eventAttendees', { count: community.event_checkins })}</div></div>
          <div className={styles.stat}><div className={styles.statValue}>{community.intros_accepted}</div><div className={styles.statLabel}>{t('impact.intros', { count: community.intros_sent })}</div></div>
          <div className={styles.stat}><div className={styles.statValue}>{community.tandems_active}</div><div className={styles.statLabel}>{t('impact.tandems', { count: community.language_level_ups })}</div></div>
          <div className={styles.stat}><div className={styles.statValue}>{community.timebank_hours}</div><div className={styles.statLabel}>{t('impact.timebank', { count: community.timebank_exchanges })}</div></div>
          <div className={styles.stat}><div className={styles.statValue}>{community.challenge_teams}</div><div className={styles.statLabel}>{t('impact.challengeTeams', { count: community.challenges })}</div></div>
          <div className={styles.stat}><div className={styles.statValue}>{community.challenge_submissions}</div><div className={styles.statLabel}>{t('impact.submissions', 'Ideas submitted')}</div></div>
          <div className={styles.stat}><div className={styles.statValue}>{community.ideas_in_budget_voting}</div><div className={styles.statLabel}>{t('impact.inBudget', 'Ideas moved to budget voting')}</div></div>
          <div className={styles.stat}><div className={styles.statValue}>{community.matching_opted_in}</div><div className={styles.statLabel}>{t('impact.matching', 'People open to co-founding')}</div></div>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: '1.25rem' }}>
        <h2 className={styles.cardTitle}><i className="pi pi-stopwatch" /> {t('impact.settlingTitle', 'Time to settle (median days from arrival)')}</h2>
        {report.settling.length === 0 ? (
          <p className={styles.muted}>{hidden}</p>
        ) : (
          <div className={styles.bars}>
            {report.settling.map((s) => {
              const max = Math.max(...report.settling.map((x) => x.median_days), 1);
              return (
                <div key={s.task_id} className={styles.barRow}>
                  <span>{tOnboarding(`tasks.${s.task_id}.title`, s.task_id)}</span>
                  <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${(s.median_days / max) * 100}%` }} /></div>
                  <span className={styles.barValue}>{Math.round(s.median_days)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className={styles.notice}>
        {t('impact.method', 'Live data, updated every 10 minutes. Answers count only with a separate opt-in, and any figure built from fewer than 10 people is hidden. Integration: IPL-12 (Immigration Policy Lab). Bridging ties: local bridges in Granovetter\'s sense. Companies: PRH open data (CC BY 4.0).')}
        {' '}{t('impact.generated', { date: formatDate(report.generated_at, i18n.language) })}
      </p>
    </div>
  );
};

export default ImpactPanel;
