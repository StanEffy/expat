import type { MunicipalityId } from '@/types/onboarding';
import type {
  MunicipalCityDataset,
  AnalyticsTimeframe,
} from '@/types/municipalAnalytics';
import { MUNICIPAL_DATASETS } from '@/constants/municipalAnalyticsData';

export const municipalAnalyticsService = {
  async getCityAnalytics(
    municipalityId: MunicipalityId,
    timeframe: AnalyticsTimeframe = 'all',
  ): Promise<MunicipalCityDataset> {
    // In production, this can call `/api/municipal/analytics/${municipalityId}?timeframe=${timeframe}`
    const dataset = MUNICIPAL_DATASETS[municipalityId] || MUNICIPAL_DATASETS.helsinki;

    // Apply multiplier if timeframe is filtered
    let growthMultiplier = 1;
    if (timeframe === 'month') growthMultiplier = 1;
    else if (timeframe === 'quarter') growthMultiplier = 2.8;
    else if (timeframe === 'year') growthMultiplier = 10.5;

    return {
      ...dataset,
      kpi: {
        ...dataset.kpi,
        monthlyGrowthPercent: Math.round(dataset.kpi.monthlyGrowthPercent * growthMultiplier * 10) / 10,
      },
    };
  },

  getAllCitiesSummaries(): Array<{
    id: MunicipalityId;
    name: string;
    totalExpats: number;
    growth: number;
    progress: number;
  }> {
    return Object.entries(MUNICIPAL_DATASETS).map(([id, dataset]) => ({
      id: id as MunicipalityId,
      name: dataset.cityName,
      totalExpats: dataset.kpi.totalExpats,
      growth: dataset.kpi.monthlyGrowthPercent,
      progress: dataset.kpi.avgIntegrationProgress,
    }));
  },

  generateCSV(dataset: MunicipalCityDataset): string {
    const rows: string[][] = [
      ['City Report', dataset.cityName],
      ['Generated At', new Date().toISOString()],
      ['Total Expats', String(dataset.kpi.totalExpats)],
      ['Monthly Growth (%)', String(dataset.kpi.monthlyGrowthPercent)],
      ['Average Integration Score (%)', String(dataset.kpi.avgIntegrationProgress)],
      ['Specialists Rate (%)', String(dataset.kpi.specialistsRate)],
      ['Families with Children (%)', String(dataset.kpi.familiesWithKidsPercent)],
      ['Satisfaction Index (1-5)', String(dataset.kpi.satisfactionIndex)],
      [],
      ['Integration Funnel Step', 'Department', 'Completion Rate (%)', 'Avg Processing Days', 'Benchmark Days', 'Severity'],
      ...dataset.funnel.map((step) => [
        step.id,
        step.department,
        String(step.completionRate),
        String(step.avgProcessingDays),
        String(step.benchmarkDays),
        step.severity,
      ]),
      [],
      ['Skill Category', 'Talents Count', 'Share (%)', 'Local Demand Level', 'Primary Industry'],
      ...dataset.skills.map((skill) => [
        skill.name,
        String(skill.count),
        String(skill.percentage),
        skill.localDemand,
        skill.topIndustry,
      ]),
      [],
      ['Top Nationalities', 'Count', 'Share (%)'],
      ...dataset.demographics.topNationalities.map((nat) => [
        nat.country,
        String(nat.count),
        String(nat.percentage),
      ]),
    ];

    return rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  },
};
