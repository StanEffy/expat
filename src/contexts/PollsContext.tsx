import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { POLL_ENDPOINTS } from '../constants/api';
import { getAuthHeaders } from '../utils/auth';

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

interface PollsContextState {
  pollsById: Record<number, PollSummary>;
  activePollIds: number[];
  myPollIds: number[];
  companyPollIds: Record<number, number[]>;
  loadingLists: boolean;
  loadingPollIds: Set<number>;
  fetchActivePolls: () => Promise<PollSummary[]>;
  fetchMyPolls: () => Promise<PollSummary[]>;
  fetchCompanyPolls: (companyId: number | string) => Promise<PollSummary[]>;
  fetchPollById: (pollId: number | string, options?: { forceRefresh?: boolean }) => Promise<PollSummary | null>;
  fetchPublicPollById: (pollId: number | string) => Promise<PollSummary | null>;
  createPoll: (
    payload: {
      title: string;
      description?: string;
      allow_multiple_choice: boolean;
      allow_text_response: boolean;
      options: string[];
      expires_at?: string | null;
    },
    options?: {
      companyId?: number | string | null;
    },
  ) => Promise<PollSummary>;
  submitPollResponse: (
    pollId: number | string,
    payload: {
      option_ids?: number[];
      text_response?: string;
      gender?: string;
      age_range?: string;
      native_language?: string;
      years_experience?: string;
    }
  ) => Promise<PollSummary | null>;
  closePoll: (pollId: number | string) => Promise<PollSummary | null>;
  updatePollCache: (poll: PollSummary) => void;
}

const PollsContext = createContext<PollsContextState | undefined>(undefined);

const normalizeOption = (option: any, fallbackIndex: number): PollOption => {
  const id =
    typeof option?.id === 'number'
      ? option.id
      : typeof option?.option_id === 'number'
      ? option.option_id
      : typeof option?.poll_option_id === 'number'
      ? option.poll_option_id
      : -Math.abs(fallbackIndex + 1);

  const text = option?.text ?? option?.title ?? option?.label ?? option?.option ?? '';

  const responses =
    typeof option?.responses_count === 'number'
      ? option.responses_count
      : typeof option?.response_count === 'number'
      ? option.response_count
      : typeof option?.votes === 'number'
      ? option.votes
      : typeof option?.count === 'number'
      ? option.count
      : undefined;

  return {
    id,
    text,
    responsesCount: responses,
  };
};

const deriveStatus = (rawStatus: unknown, expiresAt?: string | null, closedAt?: string | null): PollStatus => {
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

const normalizePoll = (poll: any): PollSummary => {
  const optionsArray = Array.isArray(poll?.options) ? poll.options : Array.isArray(poll?.poll_options) ? poll.poll_options : [];
  const normalizedOptions: PollOption[] = optionsArray.map((option: any, idx: number) => normalizeOption(option, idx));

  const expiresAt = poll?.expires_at ?? poll?.expiry_date ?? null;
  const closedAt = poll?.closed_at ?? null;
  const status = deriveStatus(poll?.status, expiresAt, closedAt);

  const textResponses = Array.isArray(poll?.text_responses) ? poll.text_responses : Array.isArray(poll?.responses_text) ? poll.responses_text : undefined;

  const stats = poll?.statistics ?? poll?.stats ?? null;
  let statistics: PollStatistics | null = null;
  if (stats && typeof stats === 'object') {
    const optionCounts = stats.option_counts ?? stats.optionCounts ?? undefined;
    let optionPercentages: Record<number, number> | undefined;
    if (optionCounts) {
      const optionCountValues = Object.values(optionCounts as Record<string, unknown>);
      const total = optionCountValues.reduce<number>(
        (acc, value) => acc + (typeof value === 'number' ? value : 0),
        0,
      );
      if (total > 0) {
        optionPercentages = Object.entries(optionCounts as Record<string, unknown>).reduce<Record<number, number>>(
          (acc, [key, value]) => {
            const numericKey = Number(key);
            acc[numericKey] = typeof value === 'number' ? Math.round((value / total) * 1000) / 10 : 0;
            return acc;
          },
          {},
        );
      }
    }

    statistics = {
      total_responses: stats.total_responses ?? stats.totalResponses,
      option_counts: optionCounts,
      optionPercentages,
      text_responses: textResponses,
      demographics: stats.demographics,
      ...stats,
    };
  }

  const hasResponded = poll?.hasResponded ?? poll?.has_responded ?? false;

  return {
    id: typeof poll?.id === 'number' ? poll.id : Number(poll?.id),
    title: poll?.title ?? '',
    description: poll?.description ?? poll?.question ?? null,
    allow_multiple_choice: Boolean(poll?.allow_multiple_choice ?? poll?.is_multiple_choice),
    allow_text_response: Boolean(poll?.allow_text_response ?? poll?.accepts_text_response),
    expires_at: expiresAt,
    closed_at: closedAt,
    status,
    options: normalizedOptions,
    company_id: poll?.company_id ?? null,
    company_name: poll?.company_name ?? poll?.company?.name ?? null,
    created_by: poll?.created_by ?? poll?.creator_id ?? null,
    created_by_name: poll?.created_by_name ?? poll?.creator_name ?? poll?.created_by_user ?? null,
    created_at: poll?.created_at ?? null,
    updated_at: poll?.updated_at ?? null,
    hasResponded,
    text_responses: textResponses,
    statistics,
  };
};

const ensureAuthHeaders = async () => {
  const headers = getAuthHeaders();
  if (!headers) {
    throw new Error('Authentication required');
  }
  return headers;
};

const PollsContextProviderInternal = ({ children }: { children: ReactNode }) => {
  const [pollsById, setPollsById] = useState<Record<number, PollSummary>>({});
  const [activePollIds, setActivePollIds] = useState<number[]>([]);
  const [myPollIds, setMyPollIds] = useState<number[]>([]);
  const [companyPollIds, setCompanyPollIds] = useState<Record<number, number[]>>({});
  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingPollIds, setLoadingPollIds] = useState<Set<number>>(new Set());

  const updatePollCache = useCallback((poll: PollSummary) => {
    setPollsById((prev) => {
      if (!poll.id) {
        return prev;
      }

      const next = { ...prev, [poll.id]: { ...(prev[poll.id] ?? {}), ...poll } };
      return next;
    });
  }, []);

  const upsertPolls = useCallback((polls: PollSummary[]) => {
    if (!polls.length) return;
    setPollsById((prev) => {
      const next = { ...prev };
      polls.forEach((poll) => {
        next[poll.id] = { ...(prev[poll.id] ?? {}), ...poll };
      });
      return next;
    });
  }, []);

  const fetchJson = useCallback(async (url: string, options?: RequestInit, requireAuth = false) => {
    let requestOptions: RequestInit = options ?? {};
    if (requireAuth) {
      const authHeaders = await ensureAuthHeaders();
      requestOptions = {
        ...requestOptions,
        headers: {
          ...authHeaders,
          ...(requestOptions.headers ?? {}),
        },
      };
    } else if (!requestOptions.headers) {
      requestOptions = {
        ...requestOptions,
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const message = errorPayload?.message ?? response.statusText ?? 'Request failed';
      const error = new Error(message);
      (error as any).status = response.status;
      (error as any).payload = errorPayload;
      throw error;
    }
    return response.json();
  }, []);

  const fetchActivePolls = useCallback(async () => {
    setLoadingLists(true);
    try {
      const data = await fetchJson(POLL_ENDPOINTS.LIST);
      const pollsArray = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const normalized: PollSummary[] = pollsArray.map((poll: any) => normalizePoll(poll));
      upsertPolls(normalized);
      setActivePollIds(normalized.map((poll) => poll.id));
      return normalized;
    } finally {
      setLoadingLists(false);
    }
  }, [fetchJson, upsertPolls]);

  const fetchMyPolls = useCallback(async () => {
    setLoadingLists(true);
    try {
      const data = await fetchJson(POLL_ENDPOINTS.LIST_MINE, undefined, true);
      const pollsArray = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const normalized: PollSummary[] = pollsArray.map((poll: any) => normalizePoll(poll));
      upsertPolls(normalized);
      setMyPollIds(normalized.map((poll) => poll.id));
      return normalized;
    } finally {
      setLoadingLists(false);
    }
  }, [fetchJson, upsertPolls]);

  const fetchCompanyPolls = useCallback(async (companyId: number | string) => {
    if (!companyId && companyId !== 0) {
      return [];
    }
    setLoadingLists(true);
    try {
      const endpoint = POLL_ENDPOINTS.COMPANY_LIST(companyId);
      const data = await fetchJson(endpoint, undefined, true);
      const pollsArray = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const normalized: PollSummary[] = pollsArray.map((poll: any) => normalizePoll(poll));
      upsertPolls(normalized);
      setCompanyPollIds((prev) => ({
        ...prev,
        [Number(companyId)]: normalized.map((poll) => poll.id),
      }));
      return normalized;
    } finally {
      setLoadingLists(false);
    }
  }, [fetchJson, upsertPolls]);

  const fetchPollById = useCallback(async (pollId: number | string, options?: { forceRefresh?: boolean }) => {
    const numericId = Number(pollId);
    if (!options?.forceRefresh && pollsById[numericId]) {
      return pollsById[numericId];
    }

    setLoadingPollIds((prev) => new Set(prev).add(numericId));
    try {
      const data = await fetchJson(POLL_ENDPOINTS.DETAIL(pollId));
      const normalized = normalizePoll(data);
      updatePollCache(normalized);
      return normalized;
    } finally {
      setLoadingPollIds((prev) => {
        const next = new Set(prev);
        next.delete(numericId);
        return next;
      });
    }
  }, [fetchJson, pollsById, updatePollCache]);

  const fetchPublicPollById = useCallback(async (pollId: number | string) => {
    const data = await fetchJson(POLL_ENDPOINTS.PUBLIC_DETAIL(pollId));
    const normalized = normalizePoll(data);
    updatePollCache(normalized);
    return normalized;
  }, [fetchJson, updatePollCache]);

  const createPoll = useCallback(async (
    payload: {
      title: string;
      description?: string;
      allow_multiple_choice: boolean;
      allow_text_response: boolean;
      options: string[];
      expires_at?: string | null;
    },
    options?: {
      companyId?: number | string | null;
    },
  ) => {
    const headers = await ensureAuthHeaders();
    const endpoint = options?.companyId ? POLL_ENDPOINTS.CREATE_FOR_COMPANY(options.companyId) : POLL_ENDPOINTS.CREATE;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const message = errorPayload?.message ?? response.statusText ?? 'Failed to create poll';
      const error = new Error(message);
      (error as any).status = response.status;
      (error as any).payload = errorPayload;
      throw error;
    }

    const data = await response.json();
    const normalized = normalizePoll(data);
    updatePollCache(normalized);
    setActivePollIds((prev) => (normalized.status === 'open' ? Array.from(new Set([normalized.id, ...prev])) : prev));
    setMyPollIds((prev) => Array.from(new Set([normalized.id, ...prev])));
    if (options?.companyId) {
      const numericCompanyId = Number(options.companyId);
      setCompanyPollIds((prev) => {
        const existing = prev[numericCompanyId] ?? [];
        return {
          ...prev,
          [numericCompanyId]: Array.from(new Set([normalized.id, ...existing])),
        };
      });
    }
    return normalized;
  }, [updatePollCache]);

  const submitPollResponse = useCallback(async (
    pollId: number | string,
    payload: {
      option_ids?: number[];
      text_response?: string;
      gender?: string;
      age_range?: string;
      native_language?: string;
      years_experience?: string;
    },
  ) => {
    const headers = await ensureAuthHeaders();
    const response = await fetch(POLL_ENDPOINTS.SUBMIT_RESPONSE(pollId), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const message = errorPayload?.message ?? response.statusText ?? 'Failed to submit poll response';
      const error = new Error(message);
      (error as any).status = response.status;
      (error as any).payload = errorPayload;
      throw error;
    }

    const data = await response.json();
    const normalized = normalizePoll(data);
    updatePollCache({
      ...normalized,
      hasResponded: true,
    });
    return normalized;
  }, [updatePollCache]);

  const closePoll = useCallback(async (pollId: number | string) => {
    const headers = await ensureAuthHeaders();
    const response = await fetch(POLL_ENDPOINTS.CLOSE(pollId), {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const message = errorPayload?.message ?? response.statusText ?? 'Failed to close poll';
      const error = new Error(message);
      (error as any).status = response.status;
      (error as any).payload = errorPayload;
      throw error;
    }

    const data = await response.json();
    const normalized = normalizePoll(data);
    updatePollCache(normalized);
    if (normalized.status === 'closed') {
      setActivePollIds((prev) => prev.filter((id) => id !== normalized.id));
    }
    return normalized;
  }, [updatePollCache]);

  const value = useMemo<PollsContextState>(() => ({
    pollsById,
    activePollIds,
    myPollIds,
    companyPollIds,
    loadingLists,
    loadingPollIds,
    fetchActivePolls,
    fetchMyPolls,
    fetchCompanyPolls,
    fetchPollById,
    fetchPublicPollById,
    createPoll,
    submitPollResponse,
    closePoll,
    updatePollCache,
  }), [
    activePollIds,
    closePoll,
    companyPollIds,
    createPoll,
    fetchActivePolls,
    fetchCompanyPolls,
    fetchPollById,
    fetchPublicPollById,
    fetchMyPolls,
    loadingLists,
    loadingPollIds,
    myPollIds,
    pollsById,
    submitPollResponse,
    updatePollCache,
  ]);

  return (
    <PollsContext.Provider value={value}>
      {children}
    </PollsContext.Provider>
  );
};

export const usePolls = (): PollsContextState => {
  const context = useContext(PollsContext);
  if (!context) {
    throw new Error('usePolls must be used within a PollsProvider');
  }
  return context;
};

export const PollsProvider = ({ children }: { children: ReactNode }) => (
  <PollsContextProviderInternal>{children}</PollsContextProviderInternal>
);

export default PollsContext;


