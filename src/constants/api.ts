// API Configuration
// In production, this will be set at build time via VITE_API_BASE_URL
// In Kubernetes, it will be set in the deployment manifest or at build time
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Auth Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/sign-in`,
  REGISTER: `${API_BASE_URL}/auth/sign-up`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  PROFILE: `${API_BASE_URL}/auth/profile`,
};

// Company Endpoints
export const COMPANY_ENDPOINTS = {
  LIST: (page: number = 1, count: number = 10) =>
    `${API_BASE_URL}/api/companies/?page=${page}&count=${count}`,
  DETAILS: (id: string) => `${API_BASE_URL}/api/companies/${id}`,
  SEARCH: (query: string) =>
    `${API_BASE_URL}/api/companies?search=${encodeURIComponent(query)}`,
};

// Default Configuration
export const DEFAULT_CONFIG = {
  INVITE_CODE: "invite123", // This should match your backend INVITE_CODE
  ITEMS_PER_PAGE: 10,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "token",
};
