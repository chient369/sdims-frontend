/**
 * Admin API Module
 * 
 * This module serves as an adapter layer between the application and the REST API.
 * It provides functions for direct API communication with the admin endpoints.
 * Each function implements a specific API call and handles the response formatting.
 */

import apiClient from '../../services/core/axios';
import { AxiosRequestConfig } from 'axios';

import {
  // User Management Types
  UserStatus,
  UserResponse,
  UserListParams,
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  
  // Role Management Types
  Permission,
  Role,
  RoleListParams,
  CreateRoleRequest,
  UpdateRoleRequest,
  
  // System Configuration Types
  SystemConfig,
  ConfigListParams,
  UpdateConfigRequest,
  
  // System Logs Types
  LogSeverity,
  LogEntityType,
  SystemLog,
  SystemLogParams
} from './types';

//-----------------------------------------------------------------------------
// User Management APIs
//-----------------------------------------------------------------------------

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

//-----------------------------------------------------------------------------
// Role Management APIs
//-----------------------------------------------------------------------------

/**
 * Get a list of all roles with pagination
 */
export const getRoles = async (params?: RoleListParams, config?: AxiosRequestConfig): Promise<{
  content: Role[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}> => {
  return apiClient.get('/api/v1/admin/roles', {
    ...config,
    params,
  });
};

/**
 * Get detailed information about a specific role
 */
export const getRoleById = async (roleId: number, config?: AxiosRequestConfig): Promise<Role> => {
  return apiClient.get(`/api/v1/admin/roles/${roleId}`, config);
};

/**
 * Create a new role
 */
export const createRole = async (roleData: CreateRoleRequest, config?: AxiosRequestConfig): Promise<Role> => {
  return apiClient.post('/api/v1/admin/roles', roleData, config);
};

/**
 * Update an existing role
 */
export const updateRole = async (roleId: number, roleData: UpdateRoleRequest, config?: AxiosRequestConfig): Promise<Role> => {
  return apiClient.put(`/api/v1/admin/roles/${roleId}`, roleData, config);
};

/**
 * Delete a role
 */
export const deleteRole = async (roleId: number, config?: AxiosRequestConfig): Promise<void> => {
  return apiClient.delete(`/api/v1/admin/roles/${roleId}`, config);
};

/**
 * Get a list of all available permissions
 */
export const getPermissions = async (config?: AxiosRequestConfig): Promise<{
  groups: {
    [key: string]: Permission[];
  };
  allPermissions: Permission[];
}> => {
  return apiClient.get('/api/v1/admin/permissions', config);
};

//-----------------------------------------------------------------------------
// System Configuration APIs
//-----------------------------------------------------------------------------

/**
 * Get all system configurations with optional filtering
 */
export const getConfigs = async (params?: ConfigListParams, config?: AxiosRequestConfig): Promise<{
  groups: {
    [key: string]: SystemConfig[];
  };
  configs: SystemConfig[];
}> => {
  return apiClient.get('/api/v1/admin/configs', {
    ...config,
    params,
  });
};

/**
 * Get a specific configuration by key
 */
export const getConfigByKey = async (configKey: string, config?: AxiosRequestConfig): Promise<SystemConfig> => {
  return apiClient.get(`/api/v1/admin/configs/${configKey}`, config);
};

/**
 * Update a configuration value
 */
export const updateConfig = async (configKey: string, data: UpdateConfigRequest, config?: AxiosRequestConfig): Promise<SystemConfig> => {
  return apiClient.put(`/api/v1/admin/configs/${configKey}`, data, config);
};

/**
 * Update multiple configurations at once
 */
export const updateMultipleConfigs = async (
  configs: { key: string; value: string | number | boolean | object }[],
  config?: AxiosRequestConfig
): Promise<{
  message: string;
  success: boolean;
  updated: SystemConfig[];
}> => {
  return apiClient.put('/api/v1/admin/configs/batch', { configs }, config);
};

//-----------------------------------------------------------------------------
// System Logs APIs
//-----------------------------------------------------------------------------

/**
 * Get system logs with filtering and pagination
 */
export const getSystemLogs = async (params?: SystemLogParams, config?: AxiosRequestConfig): Promise<{
  content: SystemLog[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sort?: string;
  };
}> => {
  return apiClient.get('/api/v1/admin/system-logs', {
    ...config,
    params,
  });
};

/**
 * Get dashboard summary of system logs
 */
export const getLogsSummary = async (
  params?: {
    startDate?: string;
    endDate?: string;
  },
  config?: AxiosRequestConfig
): Promise<{
  totalErrors: number;
  totalWarnings: number;
  criticalErrors: number;
  topModules: {
    module: string;
    count: number;
  }[];
  recentErrors: SystemLog[];
  timeDistribution: {
    labels: string[];
    errors: number[];
    warnings: number[];
    info: number[];
  };
}> => {
  return apiClient.get('/api/v1/admin/system-logs/summary', {
    ...config,
    params,
  });
};

/**
 * Export system logs to file
 */
export const exportSystemLogs = async (params?: SystemLogParams, config?: AxiosRequestConfig): Promise<Blob> => {
  return apiClient.get('/api/v1/admin/system-logs/export', {
    ...config,
    params,
    responseType: 'blob'
  });
}; 