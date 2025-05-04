import React from 'react';
import { Button, ButtonProps } from '../ui/Button';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionButtonProps extends ButtonProps {
  permissions?: string[];
  roles?: string[];
  all?: boolean;
  hideWhenUnauthorized?: boolean;
}

/**
 * Button component that automatically manages permissions/authorization state
 * @param {PermissionButtonProps} props - Component props
 * @returns {React.ReactNode} A button that is enabled/visible based on permissions
 */
export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permissions = [],
  roles = [],
  all = true,
  hideWhenUnauthorized = false,
  children,
  ...rest
}) => {
  const { canAll, canAny, isAllRoles, isAny } = usePermissions();

  const hasRequiredPermissions =
    permissions.length === 0 ||
    (all ? canAll(permissions) : canAny(permissions));

  const hasRequiredRoles =
    roles.length === 0 ||
    (all ? isAllRoles(roles) : isAny(roles));

  const hasAccess = hasRequiredPermissions && hasRequiredRoles;

  if (!hasAccess && hideWhenUnauthorized) {
    return null;
  }

  return (
    <Button
      {...rest}
      disabled={!hasAccess || rest.disabled}
      title={!hasAccess ? "You don't have permission to perform this action" : rest.title}
    >
      {children}
    </Button>
  );
}; 