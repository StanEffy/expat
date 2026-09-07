export type PollStatus = 'open' | 'closed';

export interface PollOption {
  id: number;
  text: string;
  responsesCount?: number;
}

export interface PollDemographicsBreakdown {
  [key: string]: number;
}

export interface PollDemographics {
  gender?: PollDemographicsBreakdown;
  age_range?: PollDemographicsBreakdown;
  native_language?: PollDemographicsBreakdown;
  years_experience?: PollDemographicsBreakdown;
  [key: string]: PollDemographicsBreakdown | undefined;
}

export interface PollStatistics {
  total_responses?: number;
  option_counts?: Record<number, number>;
  optionPercentages?: Record<number, number>;
  text_responses?: string[];
  demographics?: PollDemographics;
  [key: string]: unknown;
}

export interface PollSummary {
  id: number;
  title: string;
  description?: string | null;
  allow_multiple_choice: boolean;
  allow_text_response: boolean;
  expires_at?: string | null;
  closed_at?: string | null;
  status: PollStatus;
  options: PollOption[];
  company_id?: number | null;
  company_name?: string | null;
  created_by?: number | null;
  created_by_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  hasResponded?: boolean;
  text_responses?: string[];
  statistics?: PollStatistics | null;
}

export interface CreatePollPayload {
  title: string;
  description?: string;
  allow_multiple_choice: boolean;
  allow_text_response: boolean;
  options: string[];
  expires_at?: string | null;
}

export interface SubmitPollPayload {
  option_ids?: number[];
  text_response?: string;
  gender?: string;
  age_range?: string;
  native_language?: string;
  years_experience?: string;
}
