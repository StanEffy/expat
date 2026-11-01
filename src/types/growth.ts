// Types for the evidence-of-impact features: integration pulse, ventures, people graph,
// time to settle, language tandems, time bank, city challenges, skills passport, impact report.

export type MunicipalityKey = 'helsinki' | 'espoo' | 'vantaa' | 'tampere' | 'turku' | 'oulu';

// --- Integration pulse (IPL-12) -------------------------------------------------------------

export type IntegrationDimension =
  | 'psychological'
  | 'navigational'
  | 'economic'
  | 'social'
  | 'political'
  | 'linguistic';

export interface IntegrationPulseAnswers {
  municipality_id: string | null;
  target_language: 'fi' | 'sv';
  connection: number;
  outsider: number;
  see_doctor: number;
  search_job: number;
  dinner: number;
  contacts: number;
  pol_understanding: number;
  pol_discuss: number;
  read_lang: number;
  speak_lang: number;
  work_status: number;
  household_income: number | null;
  household_size: number | null;
  stay_intention: number | null;
  share_for_statistics: boolean;
}

export interface IntegrationPulse extends IntegrationPulseAnswers {
  id: number;
  created_at: string;
  psychological: number;
  navigational: number;
  economic?: number;
  social: number;
  political: number;
  linguistic: number;
  ipl_score?: number;
}

export interface IntegrationPulseStatus {
  history: IntegrationPulse[];
  next_available_at?: string;
  can_submit: boolean;
}

// --- Ventures ------------------------------------------------------------------------------

export interface RegistryCompany {
  business_id: string;
  name: string;
  company_form: string;
  main_business_line: string;
  business_line_code: string;
  city: string;
  registration_date?: string;
  end_date?: string;
  business_id_status: string;
  in_restructuring_or_liquidation: boolean;
  is_active: boolean;
}

export interface VentureMember {
  user_id: number;
  name: string;
  confirmed: boolean;
}

export interface Venture extends RegistryCompany {
  id: number;
  met_on_platform: boolean;
  created_at: string;
  last_checked_at: string;
  members: VentureMember[];
  my_confirmed: boolean;
}

// --- People graph --------------------------------------------------------------------------

export type ConnectionSource = 'high_five' | 'event' | 'coop' | 'tandem' | 'timebank' | 'challenge';

export interface Person {
  user_id: number;
  name: string;
}

export interface Connection {
  user_id: number;
  name: string;
  email?: string;
  sources: ConnectionSource[];
  since: string;
}

export interface CheckinEvent {
  id: number;
  municipality_id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

export interface EventAttendee {
  user_id: number;
  name: string;
  marked_by_me: boolean;
  connected: boolean;
}

export interface CheckinResult {
  event: CheckinEvent;
  attendees: EventAttendee[];
}

export interface CoopIntro {
  id: number;
  from_user_id: number;
  from_name: string;
  to_user_id: number;
  to_name: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface EndorsementSummary {
  skill: string;
  count: number;
  endorsers: string[];
  endorsed_by_me: boolean;
}

export interface CreateEventPayload {
  municipality_id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
}

// --- Time to settle ------------------------------------------------------------------------

export interface SettlingProfile {
  arrival_month?: string;
  municipality_id?: string;
  share_for_statistics: boolean;
}

export interface SettlingState {
  profile: SettlingProfile;
  completions: { task_id: string; completed_on: string }[];
}

// --- Language tandems ----------------------------------------------------------------------

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'native';

export interface UserLanguage {
  language: string;
  level: CefrLevel;
  learning: boolean;
  can_help: boolean;
}

export interface TandemProfile {
  settings: { visible: boolean; municipality_id?: string };
  languages: UserLanguage[];
  history: { language: string; level: CefrLevel; recorded_at: string }[];
}

export interface TandemCandidate {
  user_id: number;
  name: string;
  they_help: string;
  their_level: CefrLevel;
  i_help?: string;
  same_city: boolean;
  municipality_id?: string;
}

export interface TandemRequest {
  id: number;
  from_user_id: number;
  from_name: string;
  to_user_id: number;
  to_name: string;
  learn_language: string;
  offer_language?: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

// --- Time bank -----------------------------------------------------------------------------

export type TimebankCategory =
  | 'language'
  | 'paperwork'
  | 'career'
  | 'tech'
  | 'home'
  | 'childcare'
  | 'cooking'
  | 'transport'
  | 'culture'
  | 'other';

export interface TimebankListing {
  id: number;
  user_id: number;
  user_name: string;
  kind: 'offer' | 'request';
  title: string;
  description: string;
  category: TimebankCategory;
  municipality_id?: string;
  active: boolean;
  created_at: string;
}

export interface TimebankExchange {
  id: number;
  listing_id?: number;
  provider_id: number;
  provider_name: string;
  receiver_id: number;
  receiver_name: string;
  hours: number;
  note: string;
  category: TimebankCategory;
  status: 'pending' | 'confirmed' | 'declined';
  proposed_by: number;
  created_at: string;
}

export interface TimebankAccount {
  balance: number;
  hours_given: number;
  hours_received: number;
  exchanges: TimebankExchange[];
  listings: TimebankListing[];
}

// --- City challenges -----------------------------------------------------------------------

export interface CityChallenge {
  id: number;
  municipality_id: string;
  title: string;
  description: string;
  status: 'open' | 'closed';
  deadline?: string;
  created_at: string;
  teams_count: number;
  submissions_count: number;
  my_team_id?: number;
}

export interface ChallengeSubmission {
  id: number;
  team_id: number;
  title: string;
  summary: string;
  link: string;
  submitted_at: string;
  proposal_id?: number;
}

export interface ChallengeTeam {
  id: number;
  name: string;
  members: Person[];
  submission?: ChallengeSubmission;
}

export interface ChallengeDetail {
  challenge: CityChallenge;
  teams: ChallengeTeam[];
}

// --- Skills passport -----------------------------------------------------------------------

export interface Passport {
  name: string;
  connections: number;
  connection_sources: Partial<Record<ConnectionSource, number>>;
  events: { title: string; date: string }[];
  endorsements: EndorsementSummary[];
  languages: {
    language: string;
    level: CefrLevel;
    first_level: CefrLevel;
    first_level_at: string;
    learning: boolean;
    can_help: boolean;
  }[];
  tandems: number;
  hours_given: number;
  hours_received: number;
  helped_with: { category: TimebankCategory; hours: number }[];
  challenges: { challenge: string; team: string; submitted: boolean; promoted: boolean }[];
  ventures: { name: string; business_id: string; registration_date?: string; is_active: boolean; city: string }[];
  public: boolean;
  public_token?: string;
}

// --- Impact report -------------------------------------------------------------------------

export interface ImpactReport {
  municipality_id?: string;
  generated_at: string;
  min_group_size: number;
  integration: {
    respondents: number;
    avg_ipl: number | null;
    ipl_respondents: number;
    dimensions: Record<IntegrationDimension, number | null>;
    avg_stay_intention: number | null;
    stay_likely_share: number | null;
    repeat_respondents: number;
    dimension_change: Partial<Record<IntegrationDimension, number | null>>;
  };
  network: {
    connected_users: number;
    connections: number;
    avg_connections: number;
    clusters: number;
    bridging_share: number | null;
    connections_by_way: Partial<Record<ConnectionSource, number>>;
  };
  ventures: {
    verified: number;
    active: number;
    met_on_platform: number;
    registered_last_2y: number;
    one_year_survival: number | null;
    one_year_survival_of: number;
  };
  community: {
    event_checkins: number;
    event_attendees: number;
    matching_opted_in: number;
    intros_sent: number;
    intros_accepted: number;
    tandems_active: number;
    language_level_ups: number;
    timebank_exchanges: number;
    timebank_hours: number;
    challenges: number;
    challenge_teams: number;
    challenge_submissions: number;
    ideas_in_budget_voting: number;
  };
  settling: { task_id: string; people: number; median_days: number }[];
}

// --- Open meetups ---

export type MeetupFormat = 'online' | 'in_person';
export type MeetupRecurrence = 'once' | 'weekly' | 'biweekly';

export interface OpenMeetup {
  id: number;
  organizer_id: number;
  organizer_name: string;
  title: string;
  description: string;
  languages: string[];
  format: MeetupFormat;
  /** place or call link; empty while an online link is hidden */
  location: string;
  location_hidden: boolean;
  municipality_id?: string;
  recurrence: MeetupRecurrence;
  start_date: string; // YYYY-MM-DD, Europe/Helsinki
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  capacity?: number;
  member_count: number;
  joined: boolean;
  is_organizer: boolean;
  next_date: string; // YYYY-MM-DD
}

export interface CreateMeetupPayload {
  title: string;
  description: string;
  languages: string[];
  format: MeetupFormat;
  location: string;
  municipality_id?: string;
  recurrence: MeetupRecurrence;
  start_date: string;
  start_time: string;
  end_time: string;
  capacity?: number;
}
