// API Configuration
// In production, this will be set at build time via VITE_API_BASE_URL
// In Kubernetes, it will be set in the deployment manifest or at build time
// For runtime detection: if no env var is set, try to detect from current host
function getApiBaseUrl(): string {
  // First, check if VITE_API_BASE_URL is set (build-time env var)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Check if we're in development (localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // If running on localhost, use localhost:8000 for dev
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    
    // In production, construct API URL from current host
    // SECURITY NOTE: If frontend and backend are on same domain, use relative URLs
    // Otherwise, use same hostname with port 8000
    // IMPORTANT: Set VITE_API_BASE_URL at build time to use a domain name instead of IP
    
    // Option 1: If backend is on same domain (e.g., behind reverse proxy)
    // Use relative URL which is more secure
    // return '/api';  // Uncomment if using path-based routing
    
    // Option 2: Backend on same host, different port
    const isHttps = protocol === 'https:';
    const apiPort = ':8000';
    const apiUrl = `${protocol}//${hostname}${apiPort}`;
    
    return apiUrl;
  }

  // Fallback for SSR or unknown context
  return 'http://localhost:8000';
}

export const API_BASE_URL = getApiBaseUrl();

// Only log API URL in development mode (not in production)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('Using API Base URL:', API_BASE_URL);
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
