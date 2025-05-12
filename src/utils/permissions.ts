/**
 * Permission utilities for handling RBAC (Role-Based Access Control)
 * Based on the format: resource:action[:scope]
 */

import { User } from '../features/auth/types';

/**
 * Check if a permission string includes a specific scope
 * @param permission Permission string in format 'resource:action[:scope]'
 * @param scope Scope to check for
 * @returns True if the permission includes the specified scope
 */
export const hasScope = (permission: string, scope: string): boolean => {
  const parts = permission.split(':');
  return parts.length > 2 && parts[2] === scope;
};

/**
 * Extract the resource from a permission string
 * @param permission Permission string in format 'resource:action[:scope]'
 * @returns The resource part of the permission
 */
export const getResource = (permission: string): string => {
  return permission.split(':')[0];
};

/**
 * Extract the action from a permission string
 * @param permission Permission string in format 'resource:action[:scope]'
 * @returns The action part of the permission
 */
export const getAction = (permission: string): string => {
  const parts = permission.split(':');
  return parts.length > 1 ? parts[1] : '';
};

/**
 * Extract the scope from a permission string
 * @param permission Permission string in format 'resource:action[:scope]'
 * @returns The scope part of the permission or undefined if no scope
 */
export const getScope = (permission: string): string | undefined => {
  const parts = permission.split(':');
  return parts.length > 2 ? parts[2] : undefined;
};

/**
 * Utility functions for checking permissions.
 * These functions implement the permissions logic described in permissions_definition.md
 */

/**
 * Checks if the user has a specific permission.
 * 
 * @param requiredPermission The permission to check for, format: 'resource:action[:scope]'
 * @param userPermissions Array of user permissions
 * @returns boolean indicating if user has the permission
 */
export const hasPermission = (requiredPermission: string, userPermissions: string[]): boolean => {
  // If no permissions array provided, deny access
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  // Exact match check
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Parse the required permission
  const [resource, action, scope] = requiredPermission.split(':');
  
  // Check for general permission without scope
  if (scope && userPermissions.includes(`${resource}:${action}`)) {
    return true;
  }
  
  // Handle scope hierarchy (all > team > own)
  if (scope === 'team' && userPermissions.includes(`${resource}:${action}:all`)) {
    return true;
  }
  
  if (scope === 'own' && (
    userPermissions.includes(`${resource}:${action}:all`) || 
    userPermissions.includes(`${resource}:${action}:team`)
  )) {
    return true;
  }
  
  if (scope === 'assigned' && userPermissions.includes(`${resource}:${action}:all`)) {
    return true;
  }
  
  return false;
};

/**
 * Checks if the user has all of the specified permissions.
 * 
 * @param requiredPermissions Array of permissions to check
 * @param userPermissions Array of user permissions
 * @returns boolean indicating if user has all of the permissions
 */
export const hasAllPermissions = (requiredPermissions: string[], userPermissions: string[]): boolean => {
  return requiredPermissions.every(permission => hasPermission(permission, userPermissions));
};

/**
 * Checks if the user has any of the specified permissions.
 * 
 * @param requiredPermissions Array of permissions to check
 * @param userPermissions Array of user permissions
 * @returns boolean indicating if user has any of the permissions
 */
export const hasAnyPermission = (requiredPermissions: string[], userPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => hasPermission(permission, userPermissions));
};

/**
 * Determines the level of access the user has to a resource based on ownership and team.
 * 
 * @param resourceOwnerId ID of the resource owner
 * @param resourceTeamId ID of the team the resource belongs to
 * @param userId Current user ID
 * @param userTeamId Current user's team ID
 * @param userRole Current user's role
 * @returns Access level: 'all', 'team', 'own', or 'none'
 */
export const getAccessLevel = (
  resourceOwnerId: number | string,
  resourceTeamId: number | string | null,
  userId: number | string,
  userTeamId: number | string | null,
  userRole: string
): 'all' | 'team' | 'own' | 'none' => {
  // Admin and Division Manager have full access
  if (userRole === 'Admin' || userRole === 'Division Manager') {
    return 'all';
  }
  
  // Leaders have team access if the resource is in their team
  if (userRole === 'Leader' && resourceTeamId && userTeamId && resourceTeamId.toString() === userTeamId.toString()) {
    return 'team';
  }
  
  // Users have own access for their own resources
  if (resourceOwnerId && userId && resourceOwnerId.toString() === userId.toString()) {
    return 'own';
  }
  
  // No access
  return 'none';
};

/**
 * Get all permissions for a specific resource
 * @param resource Resource name
 * @param userPermissions List of user's permissions
 * @returns List of permissions for the specified resource
 */
export const getResourcePermissions = (
  resource: string,
  userPermissions: string[]
): string[] => {
  return userPermissions.filter(permission => 
    permission.startsWith(`${resource}:`)
  );
};

/**
 * Determine user's access scope for a resource
 * @param user Current user
 * @param resourceOwnerId Owner ID of the resource
 * @param resourceTeamId Team ID of the resource
 * @returns Access scope (all, team, own, or none)
 */
export const getAccessScope = (
  user: User | null,
  resourceOwnerId?: string,
  resourceTeamId?: string
): 'all' | 'team' | 'own' | 'none' => {
  if (!user) return 'none';
  
  // Kiểm tra vai trò Admin hoặc Division Manager
  const isAdminOrDivisionManager = Array.isArray(user.role) 
    ? user.role.some(r => typeof r === 'string' && ['admin', 'division manager'].includes(r.toLowerCase()))
    : (typeof user.role === 'string' && ['admin', 'division manager'].includes(user.role.toLowerCase()));
  
  // Admin or Division Manager has access to all resources
  if (isAdminOrDivisionManager) {
    return 'all';
  }
  
  // Kiểm tra vai trò Leader
  const isLeader = Array.isArray(user.role)
    ? user.role.some(r => typeof r === 'string' && r.toLowerCase() === 'leader')
    : (typeof user.role === 'string' && user.role.toLowerCase() === 'leader');
  
  // User is a Leader
  if (isLeader) {
    // Nếu có thông tin resourceTeamId, kiểm tra xem có phải team của leader không
    if (resourceTeamId) {
      // Check if the leader is responsible for this team
      const userTeams = user.permissions?.filter(p => p.includes(':team')) || [];
      if (userTeams.length > 0) {
        return 'team';
      }
    } else {
      // Nếu không có thông tin cụ thể về resourceTeamId, Leader mặc định có quyền team
      return 'team';
    }
  }
  
  // User is the owner of the resource
  if (resourceOwnerId && resourceOwnerId === user.id) {
    return 'own';
  }
  
  // Nếu không có thông tin cụ thể về resource, mặc định user thường có quyền own
  if (!resourceOwnerId && !resourceTeamId) {
    return 'own';
  }
  
  return 'none';
}; 