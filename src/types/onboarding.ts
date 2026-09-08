export type MunicipalityId =
  | 'helsinki'
  | 'espoo'
  | 'vantaa'
  | 'tampere'
  | 'turku'
  | 'oulu'
  | 'other';

export type CitizenshipCategory = 'eu_eea' | 'nordic' | 'non_eu';

export type RelocationReason =
  | 'employed'
  | 'specialist'
  | 'entrepreneur'
  | 'student'
  | 'family'
  | 'jobseeker';

export type FamilyStatus =
  | 'solo'
  | 'couple'
  | 'children_preschool'
  | 'children_school';

export interface OnboardingAnswers {
  municipality: MunicipalityId;
  citizenship: CitizenshipCategory;
  reason: RelocationReason;
  family: FamilyStatus;
}

export type TaskCategory =
  | 'legal'
  | 'tax_finance'
  | 'healthcare'
  | 'family_education'
  | 'housing'
  | 'integration_language'
  | 'daily_life';

export type TaskPhase =
  | 'before_arrival'
  | 'first_days'
  | 'first_month'
  | 'settled';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'optional';

export interface OfficialLink {
  title: string;
  url: string;
  isOfficial?: boolean;
}

export interface MunicipalContactInfo {
  id: MunicipalityId;
  name: string;
  hubName: string;
  address?: string;
  website: string;
  email?: string;
  phone?: string;
  serviceBookingUrl?: string;
  descriptionKey: string;
}

export interface OnboardingTask {
  id: string;
  category: TaskCategory;
  phase: TaskPhase;
  priority: TaskPriority;
  titleKey: string;
  descriptionKey: string;
  estimatedDays?: string;
  requiredDocuments?: string[];
  officialLinks: OfficialLink[];
  applicableMunicipalities?: MunicipalityId[];
  applicableCitizenships?: CitizenshipCategory[];
  applicableReasons?: RelocationReason[];
  applicableFamily?: FamilyStatus[];
  municipalNotes?: Partial<Record<MunicipalityId, string>>;
}

export interface UserOnboardingProgress {
  answers: OnboardingAnswers;
  completedTaskIds: string[];
  lastUpdated: string;
}
