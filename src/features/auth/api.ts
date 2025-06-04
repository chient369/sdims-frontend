import apiClient from '../../services/core/axios';
import { AxiosRequestConfig } from 'axios';
import { LoginCredentials, AuthResponse, RefreshTokenRequest, UserProfile } from './types';

/**
 * API function to authenticate a user
 * @param credentials User's login credentials
 * @returns Promise containing auth response with token and user info
 */
export const login = async (credentials: LoginCredentials, config?: AxiosRequestConfig): Promise<AuthResponse> => {
  return (await apiClient.post('/api/v1/auth/login', credentials, config)).data;
};

/**
 * API function to get the current user's profile and permissions
 * @returns Promise containing the user profile with detailed information
 */
export const getUserProfile = async (config?: AxiosRequestConfig): Promise<UserProfile> => {
  return (await apiClient.get('/api/v1/auth/me', config)).data;
};

/**
 * API function to log out a user
 * @returns Promise that resolves when logout is successful
 */
export const logout = async (config?: AxiosRequestConfig): Promise<void> => {
  try {
    console.log('API: Sending logout request to server');
    await apiClient.post('/api/v1/auth/logout', {}, config);
    console.log('API: Logout response received successfully');
    return;
  } catch (error) {
    console.error('API: Error during logout request:', error);
    // Still want to complete logout on client side even if server request fails
    // So we'll resolve the promise rather than rejecting it
    return Promise.resolve();
  }
};

/**
 * API function to refresh an access token
 * @param refreshTokenRequest Object containing the refresh token
 * @returns Promise containing auth response with new tokens
 */
export const refreshToken = async (refreshTokenRequest: RefreshTokenRequest, config?: AxiosRequestConfig): Promise<AuthResponse> => {
  return (await apiClient.post('/api/v1/auth/refresh-token', refreshTokenRequest, config)).data;
};

/**
 * API function to request a password reset
 * @param email User's email address
 * @returns Promise that resolves when the request is successful
 */
export const requestPasswordReset = async (email: string, config?: AxiosRequestConfig): Promise<void> => {
  return (await apiClient.post('/api/v1/auth/request-password-reset', { email }, config)).data;
};

/**
 * API function to reset password
 * @param token Reset token from email
 * @param newPassword New password
 * @returns Promise that resolves when password is reset
 */
export const resetPassword = async (token: string, newPassword: string, config?: AxiosRequestConfig): Promise<void> => {
  return (await apiClient.post('/api/v1/auth/reset-password', { token, newPassword }, config)).data;
}; 