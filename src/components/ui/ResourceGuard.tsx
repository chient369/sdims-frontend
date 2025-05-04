import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ResourceGuardProps {
  requiredPermission: string;
  resourceOwnerId?: string;
  resourceTeamId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions and resource ownership
 * @param {ResourceGuardProps} props - Component props
 * @returns {React.ReactNode} The rendered children if user has permission, otherwise fallback
 */
const ResourceGuard: React.FC<ResourceGuardProps> = ({
  requiredPermission,
  resourceOwnerId,
  resourceTeamId,
  children,
  fallback = null,
}) => {
  const { hasPermission, getAccessScope } = useAuth();
  
  // Parse the permission to get resource, action, and any explicitly specified scope
  const [resource, action, explicitScope] = requiredPermission.split(':');
  
  // Get the user's access scope for this resource
  const accessScope = getAccessScope(resourceOwnerId, resourceTeamId);
  
  // Check basic permission first
  if (!hasPermission(`${resource}:${action}`)) {
    return <>{fallback}</>;
  }
  
  // If no scope is specified, allow access
  if (!explicitScope) {
    return <>{children}</>;
  }
  
  // If user has "all" access scope, they can access anything
  if (accessScope === 'all') {
    return <>{children}</>;
  }
  
  // Check if the user has permission for their access scope
  if (hasPermission(`${resource}:${action}:${accessScope}`)) {
    return <>{children}</>;
  }
  
  // Check hierarchical access based on scope
  // If required scope is 'own' and user has 'team' access
  if (explicitScope === 'own' && accessScope === 'team') {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default ResourceGuard; 