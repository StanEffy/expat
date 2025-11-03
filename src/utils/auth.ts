import { STORAGE_KEYS } from '../constants/api';

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

// Helper function to check if we should redirect to login
export const shouldRedirectToLogin = (): boolean => {
  // Check if we're already on the login page to prevent infinite loops
  if (typeof window !== 'undefined' && window.location.pathname === '/login') {
    return false;
  }
  return !isTokenValid();
}; 