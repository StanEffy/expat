import { apiClient } from './apiClient';
import { POLL_ENDPOINTS } from '@/constants/api';
import type {
  PollSummary,
  PollOption,
  PollStatus,
  PollStatistics,
  CreatePollPayload,
  SubmitPollPayload,
} from '@/types/poll';

const deriveStatus = (
  rawStatus: unknown,
  expiresAt?: string | null,
  closedAt?: string | null,
): PollStatus => {
  if (rawStatus === 'closed') return 'closed';
  if (rawStatus === 'open') return 'open';
  if (closedAt) return 'closed';
  if (expiresAt) {
    const expiration = new Date(expiresAt);
    if (!Number.isNaN(expiration.getTime()) && expiration.getTime() <= Date.now()) {
      return 'closed';
    }
  }
  return 'open';
};

const normalizeOption = (rawOption: unknown, fallbackIndex: number): PollOption => {
  const option = (rawOption && typeof rawOption === 'object' ? rawOption : {}) as Record<string, unknown>;

  const id =
    typeof option.id === 'number'
      ? option.id
      : typeof option.option_id === 'number'
      ? option.option_id
      : typeof option.poll_option_id === 'number'
      ? option.poll_option_id
      : -Math.abs(fallbackIndex + 1);

  const text = String(option.text ?? option.title ?? option.label ?? option.option ?? '');

  const responses =
    typeof option.responses_count === 'number'
      ? option.responses_count
      : typeof option.response_count === 'number'
      ? option.response_count
      : typeof option.votes === 'number'
      ? option.votes
      : typeof option.count === 'number'
      ? option.count
      : undefined;

  return {
    id,
    text,
    responsesCount: responses,
  };
};

export const normalizePoll = (raw: unknown): PollSummary => {
  const poll = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const optionsArray = Array.isArray(poll.options)
    ? poll.options
    : Array.isArray(poll.poll_options)
    ? poll.poll_options
    : [];
  const normalizedOptions: PollOption[] = optionsArray.map((opt, idx) => normalizeOption(opt, idx));

  const expiresAt =
    typeof poll.expires_at === 'string'
      ? poll.expires_at
      : typeof poll.expiry_date === 'string'
      ? poll.expiry_date
      : null;
  const closedAt = typeof poll.closed_at === 'string' ? poll.closed_at : null;
  const status = deriveStatus(poll.status, expiresAt, closedAt);

  const textResponses = Array.isArray(poll.text_responses)
    ? (poll.text_responses as string[])
    : Array.isArray(poll.responses_text)
    ? (poll.responses_text as string[])
    : undefined;

  const rawStats = (poll.statistics ?? poll.stats ?? null) as Record<string, unknown> | null;
  let statistics: PollStatistics | null = null;
  if (rawStats && typeof rawStats === 'object') {
    const optionCounts = (rawStats.option_counts ?? rawStats.optionCounts) as
      | Record<number, number>
      | undefined;
    let optionPercentages: Record<number, number> | undefined;

    if (optionCounts) {
      const optionCountValues = Object.values(optionCounts);
      const total = optionCountValues.reduce<number>(
        (acc, val) => acc + (typeof val === 'number' ? val : 0),
        0,
      );
      if (total > 0) {
        optionPercentages = Object.entries(optionCounts).reduce<Record<number, number>>(
          (acc, [key, val]) => {
            const numericKey = Number(key);
            acc[numericKey] = typeof val === 'number' ? Math.round((val / total) * 1000) / 10 : 0;
            return acc;
          },
          {},
        );
      }
    }

    statistics = {
      total_responses:
        typeof rawStats.total_responses === 'number'
          ? rawStats.total_responses
          : typeof rawStats.totalResponses === 'number'
          ? rawStats.totalResponses
          : undefined,
      option_counts: optionCounts,
      optionPercentages,
      text_responses: textResponses,
      demographics: rawStats.demographics as PollStatistics['demographics'],
      ...rawStats,
    };
  }

  const hasResponded = Boolean(poll.hasResponded ?? poll.has_responded ?? false);

  return {
    id: typeof poll.id === 'number' ? poll.id : Number(poll.id),
    title: String(poll.title ?? ''),
    description: typeof poll.description === 'string' ? poll.description : (poll.question as string | null) ?? null,
    allow_multiple_choice: Boolean(poll.allow_multiple_choice ?? poll.is_multiple_choice),
    allow_text_response: Boolean(poll.allow_text_response ?? poll.accepts_text_response),
    expires_at: expiresAt,
    closed_at: closedAt,
    status,
    options: normalizedOptions,
    company_id: typeof poll.company_id === 'number' ? poll.company_id : null,
    company_name:
      typeof poll.company_name === 'string'
        ? poll.company_name
        : typeof (poll.company as Record<string, unknown> | undefined)?.name === 'string'
        ? ((poll.company as Record<string, unknown>).name as string)
        : null,
    created_by: typeof poll.created_by === 'number' ? poll.created_by : (poll.creator_id as number | null) ?? null,
    created_by_name:
      typeof poll.created_by_name === 'string'
        ? poll.created_by_name
        : typeof poll.creator_name === 'string'
        ? poll.creator_name
        : (poll.created_by_user as string | null) ?? null,
    created_at: typeof poll.created_at === 'string' ? poll.created_at : null,
    updated_at: typeof poll.updated_at === 'string' ? poll.updated_at : null,
    hasResponded,
    text_responses: textResponses,
    statistics,
  };
};

export const pollService = {
  async getActivePolls(): Promise<PollSummary[]> {
    const data = await apiClient.get<unknown>(POLL_ENDPOINTS.LIST);
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as Record<string, unknown>)?.data)
      ? ((data as Record<string, unknown>).data as unknown[])
      : [];
    return list.map(normalizePoll);
  },

  async getMyPolls(): Promise<PollSummary[]> {
    const data = await apiClient.get<unknown>(POLL_ENDPOINTS.LIST_MINE, { requireAuth: true });
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as Record<string, unknown>)?.data)
      ? ((data as Record<string, unknown>).data as unknown[])
      : [];
    return list.map(normalizePoll);
  },

  async getCompanyPolls(companyId: number | string): Promise<PollSummary[]> {
    const data = await apiClient.get<unknown>(POLL_ENDPOINTS.COMPANY_LIST(companyId), {
      requireAuth: true,
    });
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as Record<string, unknown>)?.data)
      ? ((data as Record<string, unknown>).data as unknown[])
      : [];
    return list.map(normalizePoll);
  },

  async getPollById(pollId: number | string): Promise<PollSummary> {
    const data = await apiClient.get<unknown>(POLL_ENDPOINTS.DETAIL(pollId), { requireAuth: true });
    return normalizePoll(data);
  },

  async getPublicPollById(pollId: number | string): Promise<PollSummary> {
    const data = await apiClient.get<unknown>(POLL_ENDPOINTS.PUBLIC_DETAIL(pollId));
    return normalizePoll(data);
  },

  async createPoll(payload: CreatePollPayload, companyId?: number | string | null): Promise<PollSummary> {
    const endpoint = companyId
      ? POLL_ENDPOINTS.CREATE_FOR_COMPANY(companyId)
      : POLL_ENDPOINTS.CREATE;
    const data = await apiClient.post<unknown>(endpoint, payload, { requireAuth: true });
    return normalizePoll(data);
  },

  async submitResponse(pollId: number | string, payload: SubmitPollPayload): Promise<PollSummary> {
    const data = await apiClient.post<unknown>(POLL_ENDPOINTS.SUBMIT_RESPONSE(pollId), payload, {
      requireAuth: true,
    });
    const normalized = normalizePoll(data);
    return {
      ...normalized,
      hasResponded: true,
    };
  },

  async closePoll(pollId: number | string): Promise<PollSummary> {
    const data = await apiClient.post<unknown>(POLL_ENDPOINTS.CLOSE(pollId), {}, {
      requireAuth: true,
    });
    return normalizePoll(data);
  },
};
