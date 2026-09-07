import { API_BASE_URL } from '@/constants/api';
import { getToken, getAdmin2FASession, removeToken } from '@/utils/auth';
import type { HttpMethod, RequestOptions } from '@/types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const buildUrl = (url: string, params?: RequestOptions['params']): string => {
  const fullUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;

  if (!params) {
    return fullUrl;
  }

  const parsedUrl = new URL(fullUrl, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') {
          parsedUrl.searchParams.append(key, String(item));
        }
      }
    } else {
      parsedUrl.searchParams.set(key, String(value));
    }
  }

  return parsedUrl.toString();
};

export const apiClient = {
  async request<T = unknown>(
    url: string,
    method: HttpMethod = 'GET',
    options: RequestOptions = {},
  ): Promise<T> {
    const {
      params,
      requireAuth = false,
      requireAdmin2FA = false,
      body,
      headers: customHeaders,
      ...customInit
    } = options;

    const targetUrl = buildUrl(url, params);

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (!(body instanceof FormData) && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    if (requireAuth || requireAdmin2FA) {
      const token = getToken();
      if (!token) {
        throw new ApiError('Authentication required', 401);
      }
      headers.Authorization = `Bearer ${token}`;
    }

    if (requireAdmin2FA) {
      const adminSession = getAdmin2FASession();
      if (!adminSession) {
        throw new ApiError('Admin 2FA verification required', 403);
      }
      headers['X-Admin-2FA-Session'] = adminSession;
    }

    if (customHeaders) {
      if (customHeaders instanceof Headers) {
        customHeaders.forEach((val, key) => {
          headers[key] = val;
        });
      } else if (Array.isArray(customHeaders)) {
        for (const [key, val] of customHeaders) {
          headers[key] = val;
        }
      } else {
        Object.assign(headers, customHeaders);
      }
    }

    let requestBody: BodyInit | null | undefined = undefined;
    if (body !== undefined) {
      if (body instanceof FormData) {
        requestBody = body;
      } else if (typeof body === 'string') {
        requestBody = body;
      } else {
        requestBody = JSON.stringify(body);
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body: requestBody,
      ...customInit,
    });

    if (!response.ok) {
      let errorPayload: unknown;
      let errorMessage = response.statusText || 'Request failed';

      try {
        errorPayload = await response.json();
        if (errorPayload && typeof errorPayload === 'object') {
          const record = errorPayload as Record<string, unknown>;
          if (typeof record.message === 'string') {
            errorMessage = record.message;
          } else if (typeof record.detail === 'string') {
            errorMessage = record.detail;
          } else if (typeof record.error === 'string') {
            errorMessage = record.error;
          }
        }
      } catch {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch {
          // ignore parsing error
        }
      }

      if (response.status === 401 && requireAuth) {
        removeToken();
      }

      throw new ApiError(errorMessage, response.status, errorPayload);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return response.text() as unknown as Promise<T>;
  },

  get<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'GET', options);
  },

  post<T = unknown>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'POST', { ...options, body });
  },

  put<T = unknown>(url: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'PUT', { ...options, body });
  },

  delete<T = unknown>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'DELETE', options);
  },
};
