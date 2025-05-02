import apiClient from '../../core/axios';
import { AxiosRequestConfig } from 'axios';
import { User } from '../../../types/user';

export interface LoginCredentials {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * API function to authenticate a user
 * @param credentials User's login credentials
 * @returns Promise containing auth response with token and user info
 */
export const login = async (credentials: LoginCredentials, config?: AxiosRequestConfig): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/v1/auth/login', credentials, config);
  // API returns { status, code, data } structure where data contains our actual auth response
  if (response?.data?.status === 'success' && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

/**
 * API function to log out a user
 * @returns Promise that resolves when logout is successful
 */
export const logout = async (config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.post('/api/v1/auth/logout', {}, config);
};

/**
 * API function to refresh an access token
 * @param refreshTokenRequest Object containing the refresh token
 * @returns Promise containing auth response with new tokens
 */
export const refreshToken = async (refreshTokenRequest: RefreshTokenRequest, config?: AxiosRequestConfig): Promise<AuthResponse> => {
  const response = await apiClient.post('/api/v1/auth/refresh-token', refreshTokenRequest, config);
  // API returns { status, code, data } structure where data contains our actual auth response
  if (response?.data?.status === 'success' && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

/**
 * API function to request a password reset
 * @param email User's email address
 * @returns Promise that resolves when the request is successful
 */
export const requestPasswordReset = async (email: string, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.post('/api/v1/auth/request-password-reset', { email }, config);
};

/**
 * API function to reset password
 * @param token Reset token from email
 * @param newPassword New password
 * @returns Promise that resolves when password is reset
 */
export const resetPassword = async (token: string, newPassword: string, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.post('/api/v1/auth/reset-password', { token, newPassword }, config);
}; 