// API Configuration
// In production, this will be set at build time via VITE_API_BASE_URL
// In Kubernetes, it will be set in the deployment manifest or at build time
// For runtime detection: if no env var is set, try to detect from current host
function getApiBaseUrl(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // SSR or unknown context - fallback
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // If running on localhost/127.0.0.1, use localhost:8000 for dev
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // In production (not localhost), detect from current host
  // Override VITE_API_BASE_URL if it's set to localhost (means wrong build config)
  const buildTimeUrl = import.meta.env.VITE_API_BASE_URL;
  const isLocalhostInBuild = buildTimeUrl && (
    buildTimeUrl.includes('localhost') || 
    buildTimeUrl.includes('127.0.0.1')
  );
  
  // If build-time URL is explicitly set and not localhost, use it
  if (buildTimeUrl && !isLocalhostInBuild) {
    return buildTimeUrl;
  }
  
  // Otherwise, auto-detect from current hostname
  // SECURITY NOTE: This uses the current hostname + port 8000
  // For better security, set VITE_API_BASE_URL at build time with a domain name
  const apiPort = ':8000';
  const apiUrl = `${protocol}//${hostname}${apiPort}`;
  
  return apiUrl;
}

export const API_BASE_URL = getApiBaseUrl();

// Log API URL for debugging (always log in production to help diagnose issues)
if (typeof window !== 'undefined') {
  console.log('[API Config] Using API Base URL:', API_BASE_URL);
  console.log('[API Config] Current hostname:', window.location.hostname);
  console.log('[API Config] Build-time VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'not set');
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
