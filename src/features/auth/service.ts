import { BaseApiService } from '../../services/core/baseApi';
import { login as loginApi, logout as logoutApi, refreshToken as refreshTokenApi } from './api';
import { User, AuthResponse, LoginCredentials, RefreshTokenRequest } from './types';

interface StoredAuthData {
  token: string;
  refreshToken: string;
  token_type: string;
  expires_in: number;
  user: User;
}

class AuthService extends BaseApiService {
  constructor() {
    super('/api/v1/auth');
  }

  /**
   * Log in a user and store authentication data
   * @param username User's email or username
   * @param password User's password
   * @param remember_me Whether to remember the login session
   * @returns Auth response with user info and tokens
   */
  async login(username: string, password: string, remember_me = false): Promise<AuthResponse> {
    try {
      const credentials: LoginCredentials = {
        username,
        password,
        remember_me
      };

      const response = await loginApi(credentials);
      
      // Store auth data
      this.setAuthData({
        token: response.token,
        refreshToken: response.refreshToken,
        token_type: response.token_type,
        expires_in: response.expires_in,
        user: response.user
      });
      
      return response;
    } catch (error) {
      // Clear any existing auth data on failed login
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Log out the user and clear authentication data
   */
  async logout(): Promise<void> {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth data, even if API call fails
      this.clearAuthData();
    }
  }

  /**
   * Refresh the access token using the refresh token
   * @returns New auth response with fresh tokens
   */
  async refreshAccessToken(): Promise<AuthResponse | null> {
    try {
      const storedData = this.getAuthData();
      
      if (!storedData || !storedData.refreshToken) {
        this.clearAuthData();
        return null;
      }
      
      const refreshRequest: RefreshTokenRequest = {
        refreshToken: storedData.refreshToken
      };
      
      const response = await refreshTokenApi(refreshRequest);
      
      // Update stored auth data
      this.setAuthData({
        token: response.token,
        refreshToken: response.refreshToken,
        token_type: response.token_type,
        expires_in: response.expires_in,
        user: response.user
      });
      
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Get the current user from local storage
   * @returns User object or null if not authenticated
   */
  getCurrentUser(): StoredAuthData['user'] | null {
    const authData = this.getAuthData();
    return authData ? authData.user : null;
  }

  /**
   * Check if the user is authenticated
   * @returns True if authenticated
   */
  isAuthenticated(): boolean {
    const authData = this.getAuthData();
    return !!authData && !!authData.token;
  }

  /**
   * Check if the user has a specific role
   * @param role Role to check
   * @returns True if the user has the role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return !!user && user.role === role;
  }

  // Helper methods for auth data storage
  private setAuthData(data: StoredAuthData): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('token_type', data.token_type);
    localStorage.setItem('expires_in', data.expires_in.toString());
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  private getAuthData(): StoredAuthData | null {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const token_type = localStorage.getItem('token_type');
    const expires_in_str = localStorage.getItem('expires_in');
    const userJson = localStorage.getItem('user');
    
    if (!token || !refreshToken || !userJson) return null;
    
    try {
      const user = JSON.parse(userJson);
      const expires_in = expires_in_str ? parseInt(expires_in_str, 10) : 3600;
      return { token, refreshToken, token_type: token_type || 'Bearer', expires_in, user };
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token_type');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService(); 