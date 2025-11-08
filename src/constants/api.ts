// API Configuration
// In production, this will be set at build time via VITE_API_BASE_URL
// In Kubernetes, it will be set in the deployment manifest or at build time
function getApiBaseUrl(): string {
  // In development mode, use localhost:8000
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }

  // In production, use build-time env var if explicitly set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Default production behavior based on domain
  const domain = 'x-pat.duckdns.org';
  // In production, use HTTPS (port 443) or HTTP (port 80) based on current page protocol
  // This ensures API calls match the frontend's protocol to avoid mixed content issues
  // Note: No port specified - uses default ports (443 for HTTPS, 80 for HTTP)
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' 
    ? 'https:' 
    : 'http:';
  return `${protocol}//${domain}`;
}

export const API_BASE_URL = getApiBaseUrl();

// Admin Panel Path - can be customized via environment variable for discretion
// Default to something less obvious than '/admin' or '/management'
export const ADMIN_PANEL_PATH = import.meta.env.VITE_ADMIN_PANEL_PATH || '/app-console';

// Log API URL for debugging (only in development, and only once)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Only log once by checking if we've logged before
  if (!(window as any).__API_CONFIG_LOGGED) {
    console.log('[API Config] Using API Base URL:', API_BASE_URL);
    (window as any).__API_CONFIG_LOGGED = true;
  }
}

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
  FILTERED: (params: {
    page?: number;
    count?: number;
    name?: string;
    mainbusinesslineid?: string;
    cities?: string[];
  }) => {
    const page = params.page ?? 1;
    const count = params.count ?? 10;
    const queryParts: string[] = [`page=${page}`, `count=${count}`];

    if (params.name && params.name.trim().length > 0) {
      queryParts.push(`name=${encodeURIComponent(params.name)}`);
    }
    if (params.mainbusinesslineid && params.mainbusinesslineid.trim().length > 0) {
      // Handle comma-separated values (split and add multiple parameters like cities)
      const ids = params.mainbusinesslineid.split(',').map(id => id.trim()).filter(id => id.length > 0);
      for (const id of ids) {
        queryParts.push(`mainbusinesslineid=${encodeURIComponent(id)}`);
      }
    }
    if (params.cities && params.cities.length > 0) {
      for (const city of params.cities) {
        if (city && city.trim().length > 0) {
          queryParts.push(`cities=${encodeURIComponent(city)}`);
        }
      }
    }

    return `${API_BASE_URL}/api/companies/?${queryParts.join("&")}`;
  },
  DETAILS: (id: string) => `${API_BASE_URL}/api/companies/${id}`,
  SEARCH: (query: string) =>
    `${API_BASE_URL}/api/companies?search=${encodeURIComponent(query)}`,
};

export const CATEGORY_ENDPOINTS = {
  LIST: `${API_BASE_URL}/api/categories`,
  GENERAL: `${API_BASE_URL}/api/general-categories`,
};

export const CITY_ENDPOINTS = {
  LIST: `${API_BASE_URL}/api/cities/`,
  REGIONS: `${API_BASE_URL}/api/city-regions`,
};

// Favourites Endpoints
export const FAVOURITES_ENDPOINTS = {
  LIST: `${API_BASE_URL}/api/favourites`,
  ADD: (companyId: number) => `${API_BASE_URL}/api/companies/${companyId}/favourite`,
  REMOVE: (companyId: number) => `${API_BASE_URL}/api/companies/${companyId}/favourite`,
};

// Notifications Endpoints
export const NOTIFICATIONS_ENDPOINTS = {
  LIST: `${API_BASE_URL}/api/notifications`,
  UNREAD: `${API_BASE_URL}/api/notifications/unread`,
  UNREAD_COUNT: `${API_BASE_URL}/api/notifications/unread-count`,
  MARK_READ: (notificationId: number) => `${API_BASE_URL}/api/notifications/${notificationId}/read`,
  MARK_ALL_READ: `${API_BASE_URL}/api/notifications/read-all`,
};

// Default Configuration
export const DEFAULT_CONFIG = {
  INVITE_CODE: "9965", // This should match your backend INVITE_CODE
  ITEMS_PER_PAGE: 10,
};

// Admin Endpoints (backend API still uses /management, frontend uses ADMIN_PANEL_PATH)
export const ADMIN_ENDPOINTS = {
  BASE: `${API_BASE_URL}/management`,
  '2FA_STATUS': `${API_BASE_URL}/management/2fa/status`,
  '2FA_SETUP': `${API_BASE_URL}/management/2fa/setup`,
  '2FA_ENABLE': `${API_BASE_URL}/management/2fa/enable`,
  '2FA_VERIFY': `${API_BASE_URL}/management/2fa/verify`,
  '2FA_SESSION_VALIDATE': `${API_BASE_URL}/management/2fa/session/validate`,
  USERS: `${API_BASE_URL}/management/users`,
  ASSIGN_ROLE: `${API_BASE_URL}/management/users/assign-role`,
  REMOVE_ROLE: `${API_BASE_URL}/management/users/remove-role`,
  COMPANY_UPDATES: (status?: string) => {
    const base = `${API_BASE_URL}/management/company-updates`;
    return status ? `${base}?status=${status}` : base;
  },
  APPROVE_UPDATE: `${API_BASE_URL}/management/company-updates/approve`,
  REJECT_UPDATE: `${API_BASE_URL}/management/company-updates/reject`,
};

// Password Reset Endpoints
export const PASSWORD_RESET_ENDPOINTS = {
  REQUEST: `${API_BASE_URL}/auth/password-reset/request`,
  RESET: `${API_BASE_URL}/auth/password-reset/reset`,
};

// Google OAuth Endpoints
export const GOOGLE_OAUTH_ENDPOINTS = {
  URL: `${API_BASE_URL}/auth/google/url`,
  CALLBACK: `${API_BASE_URL}/auth/google/callback`,
};

// Poll Endpoints
export const POLL_ENDPOINTS = {
  LIST: `${API_BASE_URL}/api/polls`,
  LIST_MINE: `${API_BASE_URL}/api/polls/mine`,
  COMPANY_LIST: (companyId: number | string) => `${API_BASE_URL}/api/companies/${companyId}/polls`,
  DETAIL: (pollId: number | string) => `${API_BASE_URL}/api/polls/${pollId}`,
  PUBLIC_DETAIL: (pollId: number | string) => `${API_BASE_URL}/api/public/polls/${pollId}`,
  CREATE: `${API_BASE_URL}/api/polls`,
  CREATE_FOR_COMPANY: (companyId: number | string) => `${API_BASE_URL}/api/companies/${companyId}/polls`,
  SUBMIT_RESPONSE: (pollId: number | string) => `${API_BASE_URL}/api/polls/${pollId}/responses`,
  CLOSE: (pollId: number | string) => `${API_BASE_URL}/api/polls/${pollId}/close`,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "token",
  ADMIN_2FA_SESSION: "admin_2fa_session",
};
