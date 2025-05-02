import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export type UserStatus = 'Active' | 'Inactive' | 'Locked';

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  fullname: string;
  employee: {
    id: number;
    code: string;
    name?: string;
  } | null;
  role: {
    id: number;
    name: string;
    permissions?: string[];
  };
  status: UserStatus;
  lastLogin?: string;
  loginHistory?: {
    timestamp: string;
    ipAddress: string;
    userAgent: string;
  }[];
  phoneNumber?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: number;
    username: string;
  };
}

export interface UserListParams {
  keyword?: string;
  roleId?: number;
  status?: UserStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CreateUserRequest {
  username: string;
  email: string;
  fullname: string;
  password: string;
  roleId: number;
  employeeId?: number;
  status: 'Active' | 'Inactive';
  phoneNumber?: string;
  note?: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullname?: string;
  roleId?: number;
  employeeId?: number;
  status?: UserStatus;
  phoneNumber?: string;
  note?: string;
  password?: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  forceChange?: boolean;
}

/**
 * Get list of system users with filtering and pagination
 */
export const getUsers = async (params?: UserListParams, config?: AxiosRequestConfig): Promise<{
  content: UserResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}> => {
  return apiClient.get('/api/v1/admin/users', {
    ...config,
    params,
  });
};

/**
 * Get detailed information about a specific user
 */
export const getUserById = async (userId: number, config?: AxiosRequestConfig): Promise<UserResponse> => {
  return apiClient.get(`/api/v1/admin/users/${userId}`, config);
};

/**
 * Create a new user
 */
export const createUser = async (userData: CreateUserRequest, config?: AxiosRequestConfig): Promise<UserResponse> => {
  return apiClient.post('/api/v1/admin/users', userData, config);
};

/**
 * Update an existing user
 */
export const updateUser = async (userId: number, userData: UpdateUserRequest, config?: AxiosRequestConfig): Promise<UserResponse> => {
  return apiClient.put(`/api/v1/admin/users/${userId}`, userData, config);
};

/**
 * Delete a user
 */
export const deleteUser = async (userId: number, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/admin/users/${userId}`, config);
};

/**
 * Reset a user's password
 */
export const resetUserPassword = async (userId: number, passwordData: ResetPasswordRequest, config?: AxiosRequestConfig): Promise<{
  message: string;
  success: boolean;
}> => {
  return apiClient.put(`/api/v1/admin/users/${userId}/reset-password`, passwordData, config);
};

/**
 * Lock a user account
 */
export const lockUserAccount = async (userId: number, config?: AxiosRequestConfig): Promise<{
  message: string;
  success: boolean;
}> => {
  return apiClient.put(`/api/v1/admin/users/${userId}/lock`, {}, config);
};

/**
 * Unlock a user account
 */
export const unlockUserAccount = async (userId: number, config?: AxiosRequestConfig): Promise<{
  message: string;
  success: boolean;
}> => {
  return apiClient.put(`/api/v1/admin/users/${userId}/unlock`, {}, config);
}; 