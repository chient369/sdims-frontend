/**
 * Types Module for Admin Feature
 * 
 * This module contains all type definitions for the admin feature.
 * Types are organized by domain and used throughout the feature.
 */

//-----------------------------------------------------------------------------
// User Management Types
//-----------------------------------------------------------------------------

/**
 * User status options
 */
export type UserStatus = 'Active' | 'Inactive' | 'Locked';

/**
 * User data response
 */
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

/**
 * Parameters for listing users
 */
export interface UserListParams {
  keyword?: string;
  roleId?: number;
  status?: UserStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Request to create a new user
 */
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

/**
 * Request to update an existing user
 */
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

/**
 * Request to reset a user's password
 */
export interface ResetPasswordRequest {
  newPassword: string;
  forceChange?: boolean;
}

//-----------------------------------------------------------------------------
// Role Management Types
//-----------------------------------------------------------------------------

/**
 * Permission data
 */
export interface Permission {
  id: string;
  name: string;
  description?: string;
  group: string;
}

/**
 * Role data
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
  userCount?: number;
  isSystemRole?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Parameters for listing roles
 */
export interface RoleListParams {
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Request to create a new role
 */
export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

/**
 * Request to update an existing role
 */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

//-----------------------------------------------------------------------------
// System Configuration Types
//-----------------------------------------------------------------------------

/**
 * System configuration data
 */
export interface SystemConfig {
  key: string;
  value: string | number | boolean | object;
  label: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'object';
  group: string;
  isSecured?: boolean;
  updatedAt?: string;
  updatedBy?: {
    id: number;
    username: string;
  };
}

/**
 * Parameters for listing configurations
 */
export interface ConfigListParams {
  group?: string;
  keyword?: string;
}

/**
 * Request to update a configuration
 */
export interface UpdateConfigRequest {
  value: string | number | boolean | object;
}

//-----------------------------------------------------------------------------
// System Logs Types
//-----------------------------------------------------------------------------

/**
 * Log severity levels
 */
export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

/**
 * Log entity types
 */
export type LogEntityType = 'USER' | 'ROLE' | 'EMPLOYEE' | 'CONTRACT' | 'OPPORTUNITY' | 'SYSTEM' | 'INTEGRATION';

/**
 * System log data
 */
export interface SystemLog {
  id: number;
  timestamp: string;
  severity: LogSeverity;
  module: string;
  action: string;
  message: string;
  details?: string;
  entityType?: LogEntityType;
  entityId?: number | string;
  ipAddress?: string;
  userAgent?: string;
  user?: {
    id: number;
    username: string;
  };
}

/**
 * Parameters for listing system logs
 */
export interface SystemLogParams {
  startDate?: string;
  endDate?: string;
  severity?: LogSeverity;
  module?: string;
  action?: string;
  entityType?: LogEntityType;
  entityId?: number | string;
  userId?: number;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
} 