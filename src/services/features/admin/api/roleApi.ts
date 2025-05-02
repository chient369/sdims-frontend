import apiClient from '../../../core/axios';
import { AxiosRequestConfig } from 'axios';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  group: string;
}

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

export interface RoleListParams {
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

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