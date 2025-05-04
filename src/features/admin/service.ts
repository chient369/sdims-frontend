/**
 * Admin Service Module
 * 
 * This module provides a higher-level interface for interacting with admin data,
 * encapsulating API calls and adding business logic when needed.
 */

import { BaseApiService } from '../../services/core/baseApi';

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

import {
  // User Management APIs
  getUsers as getUsersApi,
  getUserById as getUserByIdApi,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  resetUserPassword as resetUserPasswordApi,
  lockUserAccount as lockUserAccountApi,
  unlockUserAccount as unlockUserAccountApi,
  
  // Role Management APIs
  getRoles as getRolesApi,
  getRoleById as getRoleByIdApi,
  createRole as createRoleApi,
  updateRole as updateRoleApi,
  deleteRole as deleteRoleApi,
  getPermissions as getPermissionsApi,
  
  // System Configuration APIs
  getConfigs as getConfigsApi,
  getConfigByKey as getConfigByKeyApi,
  updateConfig as updateConfigApi,
  updateMultipleConfigs as updateMultipleConfigsApi,
  
  // System Logs APIs
  getSystemLogs as getSystemLogsApi,
  getLogsSummary as getLogsSummaryApi,
  exportSystemLogs as exportSystemLogsApi
} from './api';

/**
 * Service for user management operations
 */
class UserService extends BaseApiService {
  constructor() {
    super('/api/v1/admin/users');
  }

  /**
   * Get a list of system users with filtering and pagination
   */
  async getUsers(params?: UserListParams): Promise<{
    content: UserResponse[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort?: string;
    };
  }> {
    return getUsersApi(params);
  }

  /**
   * Get detailed information about a specific user
   */
  async getUserById(userId: number): Promise<UserResponse> {
    return getUserByIdApi(userId);
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    return createUserApi(userData);
  }

  /**
   * Update an existing user
   */
  async updateUser(userId: number, userData: UpdateUserRequest): Promise<UserResponse> {
    return updateUserApi(userId, userData);
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: number): Promise<void> {
    return deleteUserApi(userId);
  }

  /**
   * Reset a user's password
   */
  async resetUserPassword(userId: number, passwordData: ResetPasswordRequest): Promise<{
    message: string;
    success: boolean;
  }> {
    return resetUserPasswordApi(userId, passwordData);
  }

  /**
   * Lock a user account
   */
  async lockUserAccount(userId: number): Promise<{
    message: string;
    success: boolean;
  }> {
    return lockUserAccountApi(userId);
  }

  /**
   * Unlock a user account
   */
  async unlockUserAccount(userId: number): Promise<{
    message: string;
    success: boolean;
  }> {
    return unlockUserAccountApi(userId);
  }

  /**
   * Get active users count (convenience method)
   */
  async getActiveUsersCount(): Promise<number> {
    const response = await this.getUsers({
      status: 'Active',
      page: 1,
      size: 1
    });
    return response.pageable.totalElements;
  }

  /**
   * Search users by keyword matching name, email, or username
   * A convenience method that simplifies the common use case of searching users
   */
  async searchUsers(keyword: string, limit: number = 10): Promise<UserResponse[]> {
    const response = await this.getUsers({
      keyword,
      page: 1,
      size: limit
    });
    return response.content;
  }

  /**
   * Get users by role (convenience method)
   */
  async getUsersByRole(roleId: number): Promise<UserResponse[]> {
    const response = await this.getUsers({
      roleId,
      status: 'Active'
    });
    return response.content;
  }
}

/**
 * Service for role management operations
 */
class RoleService extends BaseApiService {
  constructor() {
    super('/api/v1/admin/roles');
  }

  /**
   * Get a list of all roles with pagination
   */
  async getRoles(params?: RoleListParams): Promise<{
    content: Role[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort?: string;
    };
  }> {
    return getRolesApi(params);
  }

  /**
   * Get detailed information about a specific role
   */
  async getRoleById(roleId: number): Promise<Role> {
    return getRoleByIdApi(roleId);
  }

  /**
   * Create a new role
   */
  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    return createRoleApi(roleData);
  }

  /**
   * Update an existing role
   */
  async updateRole(roleId: number, roleData: UpdateRoleRequest): Promise<Role> {
    return updateRoleApi(roleId, roleData);
  }

  /**
   * Delete a role
   */
  async deleteRole(roleId: number): Promise<void> {
    return deleteRoleApi(roleId);
  }

  /**
   * Get a list of all available permissions
   */
  async getPermissions(): Promise<{
    groups: {
      [key: string]: Permission[];
    };
    allPermissions: Permission[];
  }> {
    return getPermissionsApi();
  }

  /**
   * Get available roles as dropdown options (convenience method)
   */
  async getRoleOptions(): Promise<{value: number; label: string}[]> {
    const response = await this.getRoles();
    return response.content.map(role => ({
      value: role.id,
      label: role.name
    }));
  }

  /**
   * Get permissions grouped by category (convenience method)
   */
  async getPermissionsByGroup(): Promise<{[group: string]: Permission[]}> {
    const response = await this.getPermissions();
    return response.groups;
  }
}

/**
 * Service for system configuration operations
 */
class ConfigService extends BaseApiService {
  constructor() {
    super('/api/v1/admin/configs');
  }

  /**
   * Get all system configurations with optional filtering
   */
  async getConfigs(params?: ConfigListParams): Promise<{
    groups: {
      [key: string]: SystemConfig[];
    };
    configs: SystemConfig[];
  }> {
    return getConfigsApi(params);
  }

  /**
   * Get a specific configuration by key
   */
  async getConfigByKey(configKey: string): Promise<SystemConfig> {
    return getConfigByKeyApi(configKey);
  }

  /**
   * Update a configuration value
   */
  async updateConfig(configKey: string, data: UpdateConfigRequest): Promise<SystemConfig> {
    return updateConfigApi(configKey, data);
  }

  /**
   * Update multiple configurations at once
   */
  async updateMultipleConfigs(
    configs: { key: string; value: string | number | boolean | object }[]
  ): Promise<{
    message: string;
    success: boolean;
    updated: SystemConfig[];
  }> {
    return updateMultipleConfigsApi(configs);
  }

  /**
   * Get configuration by group (convenience method)
   */
  async getConfigsByGroup(group: string): Promise<SystemConfig[]> {
    const response = await this.getConfigs({ group });
    return response.configs;
  }

  /**
   * Get configuration value directly (convenience method)
   */
  async getConfigValue<T>(key: string): Promise<T> {
    const config = await this.getConfigByKey(key);
    return config.value as T;
  }

  /**
   * Update a boolean configuration value (convenience method)
   */
  async toggleBooleanConfig(key: string): Promise<SystemConfig> {
    const config = await this.getConfigByKey(key);
    if (typeof config.value !== 'boolean') {
      throw new Error(`Config '${key}' is not a boolean value`);
    }
    return this.updateConfig(key, { value: !config.value });
  }
}

/**
 * Service for system logs operations
 */
class SystemLogService extends BaseApiService {
  constructor() {
    super('/api/v1/admin/system-logs');
  }

  /**
   * Get system logs with filtering and pagination
   */
  async getSystemLogs(params?: SystemLogParams): Promise<{
    content: SystemLog[];
    pageable: {
      pageNumber: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      sort?: string;
    };
  }> {
    return getSystemLogsApi(params);
  }

  /**
   * Get dashboard summary of system logs
   */
  async getLogsSummary(
    params?: {
      startDate?: string;
      endDate?: string;
    }
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
  }> {
    return getLogsSummaryApi(params);
  }

  /**
   * Export system logs to file
   */
  async exportSystemLogs(params?: SystemLogParams): Promise<Blob> {
    return exportSystemLogsApi(params);
  }

  /**
   * Get daily error summary for the past N days (convenience method)
   */
  async getErrorTrendData(days: number = 7): Promise<{
    dates: string[];
    counts: number[];
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const summary = await this.getLogsSummary({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
    
    return {
      dates: summary.timeDistribution.labels,
      counts: summary.timeDistribution.errors
    };
  }

  /**
   * Get recent critical errors (convenience method)
   */
  async getRecentCriticalErrors(limit: number = 5): Promise<SystemLog[]> {
    const logs = await this.getSystemLogs({
      severity: 'CRITICAL',
      page: 1,
      size: limit,
      sortBy: 'timestamp',
      sortDir: 'desc'
    });
    
    return logs.content;
  }
}

// Create and export singleton instances
export const userService = new UserService();
export const roleService = new RoleService();
export const configService = new ConfigService();
export const systemLogService = new SystemLogService();

// Default export
export default {
  userService,
  roleService,
  configService,
  systemLogService
}; 