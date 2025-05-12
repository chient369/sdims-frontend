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
  private remember: boolean = false;

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
      this.remember = remember_me;
      const credentials: LoginCredentials = {
        username,
        password,
        remember_me
      };

      const response = await loginApi(credentials);
      
      console.log('Login API Response:', JSON.stringify(response, null, 2));
      
      // Store auth data based on remember_me flag
      this.setAuthData({
        token: response.token,
        refreshToken: response.refreshToken,
        token_type: response.token_type,
        expires_in: response.expires_in,
        user: response.user
      });
      
      return response;
    } catch (error) {
      console.error('Login error in service:', error);
      // Clear any existing auth data on failed login
      this.clearAuthData();
      throw error;
    }
  }

  /**
   * Log out the user and clear authentication data
   */
  async logout(): Promise<void> {
    console.log('AuthService: Starting logout process');
    try {
      // First clear local data to ensure the user sees the logout effect immediately
      this.clearAuthData();
      
      // Then attempt to notify the server
      const result = await logoutApi();
      console.log('AuthService: Server logout successful', result);
    } catch (error) {
      console.error('AuthService: Logout API error:', error);
      // We've already cleared local data, so the user is effectively logged out
      // Just log the error but don't throw it to avoid blocking the logout process
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
      
      // Update stored auth data while maintaining the same storage type
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
   * Get the current user from storage
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
   * Check if the current authentication session is remembered
   * @returns True if using localStorage, false if using sessionStorage
   */
  isRemembered(): boolean {
    return localStorage.getItem('auth_remember') === 'true';
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

  /**
   * Check if the token needs to be refreshed
   * @returns True if token is expired or close to expiration
   */
  shouldRefreshToken(): boolean {
    const token = this.getStorage().getItem('token');
    const expiresAtStr = this.getStorage().getItem('expires_at');
    
    if (!token || !expiresAtStr) return false;
    
    const expiresAt = parseInt(expiresAtStr, 10);
    const now = Date.now();
    
    // Refresh if token expires in less than 5 minutes
    return expiresAt - now < 5 * 60 * 1000;
  }

  // Helper methods for auth data storage
  private setAuthData(data: StoredAuthData): void {
    try {
      const storage = this.getStorage();
      
      // Make sure user data is valid and can be serialized
      const userStr = JSON.stringify(data.user);
      
      // Store token data
      storage.setItem('token', data.token);
      storage.setItem('refreshToken', data.refreshToken);
      storage.setItem('token_type', data.token_type);
      storage.setItem('expires_in', data.expires_in.toString());
      
      // Calculate and store absolute expiration time
      const expiresAt = Date.now() + (data.expires_in * 1000);
      storage.setItem('expires_at', expiresAt.toString());
      
      // Store user data
      storage.setItem('user', userStr);
      
      // Remember the storage preference for future reference
      localStorage.setItem('auth_remember', this.remember.toString());
    } catch (error) {
      console.error('Error storing auth data:', error);
      // If we can't store the data, clear everything to avoid inconsistent state
      this.clearAuthData();
    }
  }

  private getAuthData(): StoredAuthData | null {
    try {
      const storage = this.getStorage();
      
      const token = storage.getItem('token');
      const refreshToken = storage.getItem('refreshToken');
      const token_type = storage.getItem('token_type');
      const expires_in_str = storage.getItem('expires_in');
      const userJson = storage.getItem('user');
      
      if (!token || !refreshToken || !userJson) return null;
      
      const user = JSON.parse(userJson);
      const expires_in = expires_in_str ? parseInt(expires_in_str, 10) : 3600;
      return { token, refreshToken, token_type: token_type || 'Bearer', expires_in, user };
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  private clearAuthData(): void {
    try {
      const storage = this.getStorage();
      
      // Clear all auth data
      storage.removeItem('token');
      storage.removeItem('refreshToken');
      storage.removeItem('token_type');
      storage.removeItem('expires_in');
      storage.removeItem('expires_at');
      storage.removeItem('user');
      
      // Also clear remember flag from localStorage
      localStorage.removeItem('auth_remember');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }
  
  /**
   * Get the appropriate storage based on remember preference
   * @returns localStorage or sessionStorage
   */
  private getStorage(): Storage {
    // Check current setting from localStorage
    const remember = localStorage.getItem('auth_remember');
    
    // If explicitly set to remember or if we're in the login process and remember is true
    if (remember === 'true' || (remember === null && this.remember)) {
      return localStorage;
    }
    
    // Default to sessionStorage (temporary session)
    return sessionStorage;
  }
}

export const authService = new AuthService(); 