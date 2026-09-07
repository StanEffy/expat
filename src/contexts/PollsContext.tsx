import { createContext, useContext, useCallback, useMemo, useState, ReactNode } from 'react';
import { pollService } from '@/services/pollService';
import type {
  PollSummary,
  PollStatus,
  PollOption,
  PollDemographics,
  PollStatistics,
  CreatePollPayload,
  SubmitPollPayload,
} from '@/types/poll';

export type {
  PollSummary,
  PollStatus,
  PollOption,
  PollDemographics,
  PollStatistics,
  CreatePollPayload,
  SubmitPollPayload,
};

export interface PollsContextState {
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
    payload: CreatePollPayload,
    options?: { companyId?: number | string | null },
  ) => Promise<PollSummary>;
  submitPollResponse: (
    pollId: number | string,
    payload: SubmitPollPayload,
  ) => Promise<PollSummary | null>;
  closePoll: (pollId: number | string) => Promise<PollSummary | null>;
  updatePollCache: (poll: PollSummary) => void;
}

export const PollsContext = createContext<PollsContextState | undefined>(undefined);

interface PollsProviderProps {
  children: ReactNode;
}

export const PollsProvider = ({ children }: PollsProviderProps) => {
  const [pollsById, setPollsById] = useState<Record<number, PollSummary>>({});
  const [activePollIds, setActivePollIds] = useState<number[]>([]);
  const [myPollIds, setMyPollIds] = useState<number[]>([]);
  const [companyPollIds, setCompanyPollIds] = useState<Record<number, number[]>>({});
  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingPollIds, setLoadingPollIds] = useState<Set<number>>(new Set());

  const updatePollCache = useCallback((poll: PollSummary) => {
    setPollsById((prev) => {
      if (!poll.id) return prev;
      return { ...prev, [poll.id]: { ...(prev[poll.id] ?? {}), ...poll } };
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

  const fetchActivePolls = useCallback(async () => {
    setLoadingLists(true);
    try {
      const normalized = await pollService.getActivePolls();
      upsertPolls(normalized);
      setActivePollIds(normalized.map((poll) => poll.id));
      return normalized;
    } finally {
      setLoadingLists(false);
    }
  }, [upsertPolls]);

  const fetchMyPolls = useCallback(async () => {
    setLoadingLists(true);
    try {
      const normalized = await pollService.getMyPolls();
      upsertPolls(normalized);
      setMyPollIds(normalized.map((poll) => poll.id));
      return normalized;
    } finally {
      setLoadingLists(false);
    }
  }, [upsertPolls]);

  const fetchCompanyPolls = useCallback(async (companyId: number | string) => {
    if (!companyId && companyId !== 0) {
      return [];
    }
    setLoadingLists(true);
    try {
      const normalized = await pollService.getCompanyPolls(companyId);
      upsertPolls(normalized);
      setCompanyPollIds((prev) => ({
        ...prev,
        [Number(companyId)]: normalized.map((poll) => poll.id),
      }));
      return normalized;
    } finally {
      setLoadingLists(false);
    }
  }, [upsertPolls]);

  const fetchPollById = useCallback(async (pollId: number | string, options?: { forceRefresh?: boolean }) => {
    const numericId = Number(pollId);
    if (!options?.forceRefresh && pollsById[numericId]) {
      return pollsById[numericId];
    }

    setLoadingPollIds((prev) => new Set(prev).add(numericId));
    try {
      const normalized = await pollService.getPollById(pollId);
      updatePollCache(normalized);
      return normalized;
    } finally {
      setLoadingPollIds((prev) => {
        const next = new Set(prev);
        next.delete(numericId);
        return next;
      });
    }
  }, [pollsById, updatePollCache]);

  const fetchPublicPollById = useCallback(async (pollId: number | string) => {
    const normalized = await pollService.getPublicPollById(pollId);
    updatePollCache(normalized);
    return normalized;
  }, [updatePollCache]);

  const createPoll = useCallback(async (
    payload: CreatePollPayload,
    options?: { companyId?: number | string | null },
  ) => {
    const normalized = await pollService.createPoll(payload, options?.companyId);
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
    payload: SubmitPollPayload,
  ) => {
    const normalized = await pollService.submitResponse(pollId, payload);
    updatePollCache(normalized);
    return normalized;
  }, [updatePollCache]);

  const closePoll = useCallback(async (pollId: number | string) => {
    const normalized = await pollService.closePoll(pollId);
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

export default PollsContext;

