export interface TokenPayload {
  exp: number;
  iat: number;
  user_id: number;
}

export interface UserRole {
  user_id?: number;
  role_id?: number;
  role_name?: string;
  role?: string;
  assigned_at?: string;
  [key: string]: unknown;
}

export interface ManagedCompany {
  id: number;
  name?: string;
  [key: string]: unknown;
}

export interface UserProfileFavourite {
  id: number;
  company_id: number;
  company?: {
    id: number;
    name: string;
    mainbusinesslinename?: string | null;
  };
}

export interface UserSkill {
  id?: number;
  name: string;
  level: string;
}

export interface UserProfile {
  id?: number;
  user_id?: number;
  name?: string;
  second_name?: string | null;
  username?: string;
  email: string;
  email_verified_at?: string | null;
  role?: string;
  roles?: UserRole[];
  managed_companies?: ManagedCompany[];
  companies?: ManagedCompany[];
  company?: ManagedCompany;
  company_id?: number;
  favourites?: UserProfileFavourite[];
  skills?: UserSkill[];
  created_at?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface TwoFAStatus {
  enabled: boolean;
  verified?: boolean;
}

export interface TwoFASetupResponse {
  secret: string;
  qr_code?: string;
  qr_url?: string;
  otpauth_url?: string;
}

export interface TwoFAVerifyResponse {
  valid: boolean;
  session_token?: string;
  message?: string;
}

export interface TwoFASessionValidation {
  valid: boolean;
  reason?: string;
}

export interface AdminUser {
  id: number;
  username?: string;
  email?: string;
  name?: string;
  roles?: UserRole[] | string[];
  role?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface InviteCode {
  id?: number;
  code: string;
  role?: string;
  company_id?: number | null;
  created_by?: number;
  expires_at?: string | null;
  is_used?: boolean;
  created_at?: string;
  [key: string]: unknown;
}
