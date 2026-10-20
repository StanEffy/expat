import { apiClient } from './apiClient';
import { COOP_ENDPOINTS } from '@/constants/api';
import type { CoopMatch, CoopProfile, CoopQuestion, SaveCoopAnswerPayload } from '@/types/coop';

export const coopService = {
  getQuestions(lang: string): Promise<CoopQuestion[]> {
    return apiClient.get<CoopQuestion[]>(COOP_ENDPOINTS.QUESTIONS, { params: { lang }, requireAuth: true });
  },

  saveAnswer(questionId: number, payload: SaveCoopAnswerPayload): Promise<void> {
    return apiClient.put(COOP_ENDPOINTS.ANSWER(questionId), payload, { requireAuth: true });
  },

  deleteAnswer(questionId: number): Promise<void> {
    return apiClient.delete(COOP_ENDPOINTS.ANSWER(questionId), { requireAuth: true });
  },

  getProfile(): Promise<CoopProfile> {
    return apiClient.get<CoopProfile>(COOP_ENDPOINTS.PROFILE, { requireAuth: true });
  },

  setMatchingEnabled(enabled: boolean): Promise<CoopProfile> {
    return apiClient.put<CoopProfile>(COOP_ENDPOINTS.PROFILE, { matching_enabled: enabled }, { requireAuth: true });
  },

  getMatches(lang: string): Promise<CoopMatch[]> {
    return apiClient.get<CoopMatch[]>(COOP_ENDPOINTS.MATCHES, { params: { lang }, requireAuth: true });
  },
};
