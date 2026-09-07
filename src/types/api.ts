export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  count?: number;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  page?: number;
  count?: number;
  total?: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  params?: Record<string, string | number | boolean | (string | number)[] | undefined | null>;
  requireAuth?: boolean;
  requireAdmin2FA?: boolean;
  body?: unknown;
}
