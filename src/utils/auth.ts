import { STORAGE_KEYS, AUTH_ENDPOINTS } from '../constants/api';

export interface TokenPayload {
  exp: number;
  iat: number;
  user_id: number;
}

export const getToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const setToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getUserId = (): number | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
    return payload.user_id;
  } catch {
    return null;
  }
};

export const getAuthHeaders = (): HeadersInit | null => {
  const token = getToken();
  if (!token) {
    // Don't redirect here - let the calling component handle it
    // This prevents infinite loops when called during render
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
    if (payload.exp * 1000 <= Date.now()) {
      removeToken();
      // Don't redirect here - let the calling component handle it
      return null;
    }
  } catch {
    removeToken();
    // Don't redirect here - let the calling component handle it
    return null;
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Admin 2FA Session Management (stored in sessionStorage, not localStorage)
export const getAdmin2FASession = (): string | null => {
  return sessionStorage.getItem(STORAGE_KEYS.ADMIN_2FA_SESSION);
};

export const setAdmin2FASession = (sessionToken: string): void => {
  sessionStorage.setItem(STORAGE_KEYS.ADMIN_2FA_SESSION, sessionToken);
};

export const removeAdmin2FASession = (): void => {
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_2FA_SESSION);
};

export const getAdminHeaders = (): HeadersInit | null => {
  const authHeaders = getAuthHeaders();
  if (!authHeaders) return null;

  const sessionToken = getAdmin2FASession();
  if (!sessionToken) return null;

  return {
    ...authHeaders,
    'X-Admin-2FA-Session': sessionToken,
  };
};

// Helper function to check if user has admin role
export const checkAdminRole = async (): Promise<boolean> => {
  const headers = getAuthHeaders();
  if (!headers) return false;

  try {
    const response = await fetch(AUTH_ENDPOINTS.PROFILE, {
      headers,
    });

    if (!response.ok) return false;

    const data = await response.json();
    // Check if user has admin role
    // Role can be in data.role or data.roles array
    if (data.role === 'admin') return true;
    if (Array.isArray(data.roles)) {
      return data.roles.some((r: any) => r.role_name === 'admin' || r === 'admin');
    }
    return false;
  } catch {
    return false;
  }
};

// Helper function to check if we should redirect to login
export const shouldRedirectToLogin = (): boolean => {
  // Check if we're already on the login page to prevent infinite loops
  if (typeof window !== 'undefined' && window.location.pathname === '/login') {
    return false;
  }
  return !isTokenValid();
}; 