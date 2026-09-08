import type { MunicipalityId } from './onboarding';

export type AnalyticsTimeframe = 'month' | 'quarter' | 'year' | 'all';

export interface MunicipalKPISummary {
  totalExpats: number;
  monthlyGrowthPercent: number;
  avgIntegrationProgress: number; // 0 to 100
  specialistsRate: number; // percentage
  familiesWithKidsPercent: number; // percentage
  satisfactionIndex: number; // 1.0 to 5.0
}

export interface TalentSkillMetric {
  name: string;
  count: number;
  percentage: number;
  localDemand: 'critical' | 'high' | 'moderate';
  topIndustry: string;
}

export interface IntegrationBottleneckStep {
  id: string;
  titleKey: string;
  department: string;
  completionRate: number; // percentage completed
  avgProcessingDays: number;
  benchmarkDays: number;
  severity: 'normal' | 'warning' | 'critical';
  insightKey: string;
}

export interface DemographicDistribution {
  citizenship: {
    eu: number;
    nordic: number;
    nonEu: number;
  };
  topNationalities: Array<{ country: string; count: number; percentage: number }>;
  nativeLanguages: Array<{ language: string; percentage: number }>;
  ageGroups: Array<{ range: string; percentage: number }>;
}

export interface MunicipalSentimentInsight {
  satisfactionScore: number;
  totalSurveyResponses: number;
  topPainPoints: Array<{ issueKey: string; count: number; severity: 'high' | 'medium' }>;
  topAttractions: Array<{ factorKey: string; count: number }>;
}

export interface MunicipalCityDataset {
  municipalityId: MunicipalityId;
  cityName: string;
  populationTotal: number;
  kpi: MunicipalKPISummary;
  skills: TalentSkillMetric[];
  funnel: IntegrationBottleneckStep[];
  demographics: DemographicDistribution;
  sentiment: MunicipalSentimentInsight;
}
