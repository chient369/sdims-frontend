/**
 * Permission utilities for handling RBAC (Role-Based Access Control)
 * Based on the format: resource:action[:scope]
 */

/**
 * Checks if a user has a specific permission
 * @param requiredPermission The permission to check for
 * @param userPermissions Array of user's permissions
 * @returns boolean
 */
export const hasPermission = (requiredPermission: string, userPermissions: string[]): boolean => {
  // Handle empty cases
  if (!requiredPermission || !userPermissions || userPermissions.length === 0) {
    return false;
  }

  // Phân tách quyền thành các phần: resource, action, scope (nếu có)
  const [resource, action, requiredScope] = requiredPermission.split(':');
  
  // Kiểm tra quyền chính xác (bao gồm cả scope)
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Kiểm tra quyền không có scope
  if (!requiredScope && userPermissions.includes(`${resource}:${action}`)) {
    return true;
  }
  
  // Nếu cần kiểm tra scope phức tạp hơn (all > team > own > basic > assigned)
  if (requiredScope) {
    // Kiểm tra từng quyền của người dùng
    for (const permission of userPermissions) {
      const [pResource, pAction, pScope] = permission.split(':');
      
      // Nếu resource và action khớp, kiểm tra scope
      if (pResource === resource && pAction === action && pScope) {
        // Nếu người dùng có quyền với scope rộng hơn
        if (requiredScope === 'team' && pScope === 'all') {
          return true;
        }
        if (requiredScope === 'own' && ['all', 'team'].includes(pScope)) {
          return true;
        }
        if (requiredScope === 'basic' && ['all', 'team', 'own'].includes(pScope)) {
          return true;
        }
        if (requiredScope === 'assigned' && ['all'].includes(pScope)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

/**
 * Checks if a user has any of the specified permissions
 * @param requiredPermissions Array of permissions to check
 * @param userPermissions Array of user's permissions
 * @returns boolean
 */
export const hasAnyPermission = (requiredPermissions: string[], userPermissions: string[]): boolean => {
  return requiredPermissions.some(perm => hasPermission(perm, userPermissions));
};

/**
 * Checks if a user has all of the specified permissions
 * @param requiredPermissions Array of permissions to check
 * @param userPermissions Array of user's permissions
 * @returns boolean
 */
export const hasAllPermissions = (requiredPermissions: string[], userPermissions: string[]): boolean => {
  return requiredPermissions.every(perm => hasPermission(perm, userPermissions));
};

/**
 * Checks access level for a particular resource based on ownership and team
 * @param resourceOwnerId The owner ID of the resource 
 * @param resourceTeamId The team ID of the resource (if applicable)
 * @param currentUser The current user object
 * @returns 'all' | 'team' | 'own' | 'none' access level
 */
export const hasDataAccess = (
  resourceOwnerId: string, 
  resourceTeamId: string | null,
  currentUser: {
    id: string;
    role?: string;
    teamId?: string;
  }
): 'all' | 'team' | 'own' | 'none' => {
  // Admin hoặc Division Manager có quyền truy cập tất cả
  if (currentUser.role === 'Admin' || currentUser.role === 'Division Manager') {
    return 'all';
  }
  
  // Leader chỉ truy cập dữ liệu trong team
  if (currentUser.role === 'Leader' && resourceTeamId === currentUser.teamId) {
    return 'team';
  }
  
  // Người dùng truy cập dữ liệu của chính mình
  if (resourceOwnerId === currentUser.id) {
    return 'own';
  }
  
  return 'none';
}; 