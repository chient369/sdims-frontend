/**
 * User type definition
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  teamId?: string;
  teams?: Array<{
    id: string;
    name: string;
  }>;
  role: string | string[];
  permissions?: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Extended user information from /api/v1/auth/me endpoint
 */
export interface UserProfile {
  user: {
    id: string;
    username: string;
    email: string;
    fullname: string;
    avatar?: string;
    role: string | string[];
    employee_id?: number;
    created_at: string;
    last_login?: string;
  };
  permissions: string[];
  settings: {
    notification_enabled: boolean;
    theme: 'light' | 'dark';
    language: 'vi' | 'en' | 'ja';
  };
}

/**
 * Login request params
 */
export interface LoginCredentials {
  username: string;
  password: string;
  remember_me?: boolean;
}

/**
 * Auth response from the API
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  token_type: string;
  expires_in: number;
  user: User;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Register user request
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Update password request
 */
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
} 