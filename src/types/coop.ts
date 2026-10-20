export type CoopCategory = 'commitment' | 'growth' | 'money' | 'risk' | 'decisions' | 'work_style' | 'values';

/** 0 = irrelevant, 1 = a little, 2 = somewhat, 3 = very, 4 = mandatory */
export type CoopImportance = 0 | 1 | 2 | 3 | 4;

export interface CoopQuestionOption {
  id: number;
  position: number;
  text: string;
}

export interface CoopAnswer {
  question_id: number;
  option_id: number;
  acceptable_option_ids: number[];
  importance: CoopImportance;
  updated_at?: string;
}

export interface CoopQuestion {
  id: number;
  code: string;
  category: CoopCategory;
  sort_order: number;
  text: string;
  options: CoopQuestionOption[];
  my_answer?: CoopAnswer;
}

export interface SaveCoopAnswerPayload {
  option_id: number;
  acceptable_option_ids: number[];
  importance: CoopImportance;
}

export interface CoopProfile {
  matching_enabled: boolean;
  matching_consent_at?: string;
  answered_count: number;
  total_questions: number;
}

export interface CoopMatchReason {
  question_id: number;
  category: CoopCategory;
  text: string;
}

export interface CoopMatch {
  user_id: number;
  name: string;
  score: number;
  common_questions: number;
  dealbreakers: number;
  agreements: CoopMatchReason[];
  conflicts: CoopMatchReason[];
}
