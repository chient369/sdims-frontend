import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

interface WithPermissionsOptions {
  permissions?: string[];
  roles?: string[];
  all?: boolean; // If true, all permissions/roles are required; if false, any is enough
  fallback?: React.ReactNode;
}

/**
 * Higher Order Component for permission-based rendering
 * @param options - Configuration options for permission checking
 * @returns A wrapped component that only renders if permissions/roles are met
 */
export function withPermissions(options: WithPermissionsOptions = {}) {
  const {
    permissions = [],
    roles = [],
    all = true,
    fallback = null,
  } = options;

  return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
    const WithPermissionsComponent: React.FC<P> = (props) => {
      const { canAll, canAny, isAllRoles, isAny } = usePermissions();

      const hasRequiredPermissions =
        permissions.length === 0 ||
        (all ? canAll(permissions) : canAny(permissions));

      const hasRequiredRoles =
        roles.length === 0 ||
        (all ? isAllRoles(roles) : isAny(roles));

      if (!hasRequiredPermissions || !hasRequiredRoles) {
        return <>{fallback}</>;
      }

      return <WrappedComponent {...props} />;
    };

    WithPermissionsComponent.displayName = `withPermissions(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithPermissionsComponent;
  };
} 