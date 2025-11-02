// API Configuration
// In production, this will be set at build time via VITE_API_BASE_URL
// In Kubernetes, it will be set in the deployment manifest or at build time
function getApiBaseUrl(): string {
  // In development mode, use relative URLs so Vite proxy can forward to localhost:8000
  // This avoids CORS issues and uses the proxy we configured in vite.config.ts
  if (import.meta.env.DEV) {
    return '';
  }

  // In production, use build-time env var if explicitly set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Default production behavior based on domain
  const domain = 'x-pat.duckdns.org';
  // In production, use HTTPS (port 443) or HTTP (port 80) based on current page protocol
  // This ensures API calls match the frontend's protocol to avoid mixed content issues
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' 
    ? 'https:' 
    : 'http:';
  return `${protocol}//${domain}`;
}

export const API_BASE_URL = getApiBaseUrl();

// Log API URL for debugging (only in development)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('[API Config] Using API Base URL:', API_BASE_URL);
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
      queryParts.push(`mainbusinesslineid=${encodeURIComponent(params.mainbusinesslineid)}`);
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

// Default Configuration
export const DEFAULT_CONFIG = {
  INVITE_CODE: "9965", // This should match your backend INVITE_CODE
  ITEMS_PER_PAGE: 10,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "token",
};
