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
 * Check if a user has a specific permission
 * @param requiredPermission Permission to check for
 * @param userPermissions List of user's permissions
 * @returns True if the user has the required permission
 */
export const hasPermission = (
  requiredPermission: string,
  userPermissions: string[]
): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  // Parse required permission into parts
  const [resource, action, scope] = requiredPermission.split(':');
  
  // Direct match for the exact permission
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check for permission without scope
  const basicPermission = `${resource}:${action}`;
  if (!scope && userPermissions.includes(basicPermission)) {
    return true;
  }
  
  // Check for broader scope permissions
  if (scope) {
    // Check scope hierarchy: all > team > own
    if (scope === 'team' && userPermissions.includes(`${resource}:${action}:all`)) {
      return true;
    }
    
    if (scope === 'own' && (
      userPermissions.includes(`${resource}:${action}:all`) ||
      userPermissions.includes(`${resource}:${action}:team`)
    )) {
      return true;
    }
  }
  
  return false;
};

/**
 * Check if a user has all of the required permissions
 * @param requiredPermissions Permissions to check for
 * @param userPermissions List of user's permissions
 * @returns True if the user has all required permissions
 */
export const hasAllPermissions = (
  requiredPermissions: string[],
  userPermissions: string[]
): boolean => {
  return requiredPermissions.every(permission => 
    hasPermission(permission, userPermissions)
  );
};

/**
 * Check if a user has any of the required permissions
 * @param requiredPermissions Permissions to check for
 * @param userPermissions List of user's permissions
 * @returns True if the user has at least one of the required permissions
 */
export const hasAnyPermission = (
  requiredPermissions: string[],
  userPermissions: string[]
): boolean => {
  return requiredPermissions.some(permission => 
    hasPermission(permission, userPermissions)
  );
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
  
  // Admin or Division Manager has access to all resources
  if (user.role === 'admin' || user.role === 'Division Manager') {
    return 'all';
  }
  
  // User is a Leader and resource belongs to their team
  // Note: Access team data based on user context, not directly from user.teamId
  if (user.role === 'Leader' && resourceTeamId) {
    // Check if the leader is responsible for this team
    // This might need to be adjusted based on how team association is stored
    const userTeams = user.permissions?.filter(p => p.includes(':team')) || [];
    if (userTeams.length > 0) {
      return 'team';
    }
  }
  
  // User is the owner of the resource
  if (resourceOwnerId && resourceOwnerId === user.id) {
    return 'own';
  }
  
  return 'none';
}; 