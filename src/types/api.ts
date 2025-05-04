/**
 * User entity representing a system user
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  avatar?: string;
  teamId?: string;
  permissions?: string[];
}

/**
 * Authentication related types
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
} 