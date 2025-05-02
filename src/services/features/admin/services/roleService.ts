import { BaseApiService } from '../../../core/baseApi';
import {
  Role,
  Permission,
  RoleListParams,
  CreateRoleRequest,
  UpdateRoleRequest,
  getRoles as getRolesApi,
  getRoleById as getRoleByIdApi,
  createRole as createRoleApi,
  updateRole as updateRoleApi,
  deleteRole as deleteRoleApi,
  getPermissions as getPermissionsApi,
} from '../api';

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
   * Get all roles as a simple list (convenience method)
   */
  async getRolesList(): Promise<{ id: number; name: string }[]> {
    const response = await this.getRoles({ 
      page: 1, 
      size: 100,  // Assuming there won't be more than 100 roles
      sortBy: 'name',
      sortDir: 'asc'
    });
    
    return response.content.map(role => ({
      id: role.id,
      name: role.name
    }));
  }

  /**
   * Check if a permission is included in a role (convenience method)
   */
  async hasPermission(roleId: number, permissionId: string): Promise<boolean> {
    const role = await this.getRoleById(roleId);
    return role.permissions.includes(permissionId);
  }
}

export const roleService = new RoleService(); 