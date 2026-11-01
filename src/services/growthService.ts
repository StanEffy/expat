import { apiClient } from './apiClient';
import type {
  ChallengeDetail,
  CheckinEvent,
  CheckinResult,
  CityChallenge,
  Connection,
  CoopIntro,
  CreateMeetupPayload,
  CreateEventPayload,
  EndorsementSummary,
  EventAttendee,
  ImpactReport,
  IntegrationPulse,
  IntegrationPulseAnswers,
  IntegrationPulseStatus,
  OpenMeetup,
  Passport,
  Person,
  RegistryCompany,
  SettlingProfile,
  SettlingState,
  TandemCandidate,
  TandemProfile,
  TandemRequest,
  TimebankAccount,
  TimebankCategory,
  TimebankListing,
  UserLanguage,
  Venture,
} from '@/types/growth';

const auth = { requireAuth: true } as const;

export const integrationService = {
  getStatus: () => apiClient.get<IntegrationPulseStatus>('/api/integration/pulse', auth),
  submit: (answers: IntegrationPulseAnswers) =>
    apiClient.post<IntegrationPulse>('/api/integration/pulse', answers, auth),
};

export const venturesService = {
  list: () => apiClient.get<Venture[]>('/api/ventures', auth),
  lookup: (businessId: string) =>
    apiClient.get<RegistryCompany>('/api/ventures/lookup', { ...auth, params: { business_id: businessId } }),
  create: (businessId: string, metOnPlatform: boolean) =>
    apiClient.post<{ id: number }>('/api/ventures', { business_id: businessId, met_on_platform: metOnPlatform }, auth),
  invite: (ventureId: number, username: string) =>
    apiClient.post(`/api/ventures/${ventureId}/members`, { username }, auth),
  accept: (ventureId: number) => apiClient.post(`/api/ventures/${ventureId}/accept`, undefined, auth),
  leave: (ventureId: number) => apiClient.delete(`/api/ventures/${ventureId}/membership`, auth),
};

export const networkService = {
  getCode: () => apiClient.get<{ code: string }>('/api/network/code', auth),
  rotateCode: () => apiClient.post<{ code: string }>('/api/network/code/rotate', undefined, auth),
  connect: (code: string) => apiClient.post<Person>('/api/network/connect', { code }, auth),
  connections: () => apiClient.get<Connection[]>('/api/network/connections', auth),
  removeConnection: (userId: number) => apiClient.delete(`/api/network/connections/${userId}`, auth),
  checkIn: (code: string) => apiClient.post<CheckinResult>('/api/network/checkin', { code }, auth),
  myEvents: () => apiClient.get<CheckinEvent[]>('/api/network/events', auth),
  attendees: (eventId: number) => apiClient.get<EventAttendee[]>(`/api/network/events/${eventId}/attendees`, auth),
  markMet: (eventId: number, userIds: number[]) =>
    apiClient.post<{ new_connections: number }>(`/api/network/events/${eventId}/met`, { user_ids: userIds }, auth),
  organisedEvents: () =>
    apiClient.get<{ events: CheckinEvent[]; is_staff: boolean }>('/api/network/organised-events', auth),
  createEvent: (payload: CreateEventPayload) =>
    apiClient.post<{ id: number }>('/api/network/organised-events', payload, auth),
  checkinCode: (eventId: number) =>
    apiClient.get<{ code: string }>(`/api/network/organised-events/${eventId}/checkin-code`, auth),
  intros: () => apiClient.get<CoopIntro[]>('/api/network/intros', auth),
  sendIntro: (toUserId: number, message: string) =>
    apiClient.post<{ id: number }>('/api/network/intros', { to_user_id: toUserId, message }, auth),
  acceptIntro: (id: number) => apiClient.post(`/api/network/intros/${id}/accept`, undefined, auth),
  declineIntro: (id: number) => apiClient.post(`/api/network/intros/${id}/decline`, undefined, auth),
  endorsements: (userId: number) =>
    apiClient.get<EndorsementSummary[]>(`/api/network/endorsements/${userId}`, auth),
  endorse: (userId: number, skill: string) =>
    apiClient.post('/api/network/endorsements', { user_id: userId, skill }, auth),
  removeEndorsement: (userId: number, skill: string) =>
    apiClient.request('/api/network/endorsements', 'DELETE', { ...auth, body: { user_id: userId, skill } }),
};

export const experimentsService = {
  variant: (key: string) => apiClient.get<{ variant: string }>(`/api/experiments/${key}`, auth),
  track: (key: string, event: string) => apiClient.post(`/api/experiments/${key}/events`, { event }, auth),
};

export const settlingService = {
  get: () => apiClient.get<SettlingState>('/api/settling', auth),
  saveProfile: (profile: SettlingProfile) => apiClient.put('/api/settling/profile', profile, auth),
  complete: (taskId: string, completedOn?: string) =>
    apiClient.put(`/api/settling/tasks/${taskId}`, completedOn ? { completed_on: completedOn } : {}, auth),
  uncomplete: (taskId: string) => apiClient.delete(`/api/settling/tasks/${taskId}`, auth),
};

export const tandemsService = {
  profile: () => apiClient.get<TandemProfile>('/api/tandems/profile', auth),
  saveProfile: (settings: TandemProfile['settings'], languages: UserLanguage[]) =>
    apiClient.put('/api/tandems/profile', { settings, languages }, auth),
  suggestions: () => apiClient.get<TandemCandidate[]>('/api/tandems/suggestions', auth),
  requests: () => apiClient.get<TandemRequest[]>('/api/tandems/requests', auth),
  send: (toUserId: number, learnLanguage: string, offerLanguage: string | undefined, message: string) =>
    apiClient.post<{ id: number }>(
      '/api/tandems/requests',
      { to_user_id: toUserId, learn_language: learnLanguage, offer_language: offerLanguage, message },
      auth,
    ),
  accept: (id: number) => apiClient.post(`/api/tandems/requests/${id}/accept`, undefined, auth),
  decline: (id: number) => apiClient.post(`/api/tandems/requests/${id}/decline`, undefined, auth),
};

export const meetupsService = {
  list: (language = '', municipality = '', format = '') =>
    apiClient.get<OpenMeetup[]>('/api/meetups', { ...auth, params: { language, municipality_id: municipality, format } }),
  create: (payload: CreateMeetupPayload) => apiClient.post<{ id: number }>('/api/meetups', payload, auth),
  cancel: (id: number) => apiClient.delete(`/api/meetups/${id}`, auth),
  join: (id: number) => apiClient.post(`/api/meetups/${id}/join`, undefined, auth),
  leave: (id: number) => apiClient.delete(`/api/meetups/${id}/join`, auth),
};

export const timebankService = {
  listings: (kind = '', category = '', municipality = '') =>
    apiClient.get<TimebankListing[]>('/api/timebank/listings', { ...auth, params: { kind, category, municipality } }),
  createListing: (payload: {
    kind: 'offer' | 'request';
    title: string;
    description: string;
    category: TimebankCategory;
    municipality_id?: string;
  }) => apiClient.post<{ id: number }>('/api/timebank/listings', payload, auth),
  closeListing: (id: number) => apiClient.delete(`/api/timebank/listings/${id}`, auth),
  account: () => apiClient.get<TimebankAccount>('/api/timebank/account', auth),
  propose: (payload: {
    counterpart_id: number;
    i_am_provider: boolean;
    hours: number;
    note: string;
    category?: TimebankCategory;
    listing_id?: number;
  }) => apiClient.post<{ id: number }>('/api/timebank/exchanges', payload, auth),
  confirm: (id: number) => apiClient.post(`/api/timebank/exchanges/${id}/confirm`, undefined, auth),
  decline: (id: number) => apiClient.post(`/api/timebank/exchanges/${id}/decline`, undefined, auth),
};

export const challengesService = {
  list: (municipality = '') =>
    apiClient.get<{ challenges: CityChallenge[]; is_staff: boolean }>('/api/challenges', {
      ...auth,
      params: { municipality },
    }),
  get: (id: number) => apiClient.get<ChallengeDetail>(`/api/challenges/${id}`, auth),
  create: (payload: { municipality_id: string; title: string; description: string; deadline?: string }) =>
    apiClient.post<{ id: number }>('/api/challenges', payload, auth),
  close: (id: number) => apiClient.post(`/api/challenges/${id}/close`, undefined, auth),
  reopen: (id: number) => apiClient.post(`/api/challenges/${id}/reopen`, undefined, auth),
  createTeam: (id: number, name: string) => apiClient.post<{ id: number }>(`/api/challenges/${id}/teams`, { name }, auth),
  joinTeam: (teamId: number) => apiClient.post(`/api/challenges/teams/${teamId}/join`, undefined, auth),
  leaveTeam: (teamId: number) => apiClient.delete(`/api/challenges/teams/${teamId}/membership`, auth),
  submit: (teamId: number, payload: { title: string; summary: string; link: string }) =>
    apiClient.put(`/api/challenges/teams/${teamId}/submission`, payload, auth),
  promote: (submissionId: number, payload: { category: string; required_budget: number; district: string }) =>
    apiClient.post<{ proposal_id: number }>(`/api/challenges/submissions/${submissionId}/promote`, payload, auth),
};

export const passportService = {
  get: () => apiClient.get<Passport>('/api/passport', auth),
  setPublic: (isPublic: boolean) =>
    apiClient.put<{ public: boolean; public_token?: string }>('/api/passport/visibility', { public: isPublic }, auth),
  getPublic: (token: string) => apiClient.get<Passport>(`/api/public/passport/${encodeURIComponent(token)}`),
};

export const impactService = {
  report: (municipality = '') =>
    apiClient.get<ImpactReport>('/api/public/impact', { params: { municipality } }),
};
