import { useAuth } from '@/contexts/AuthContext';
import { StaffPermissions, DEFAULT_PERMISSIONS } from '@/types/permissions';

export function usePermissions(): {
  permissions: StaffPermissions;
  isOwner: boolean;
  hasPermission: (permission: keyof StaffPermissions) => boolean;
  loading: boolean;
} {
  const { user } = useAuth();

  // Check if user is owner
  const isOwner = (user as any)?.business?.ownerId === user?.id;

  // Get permissions from user object
  const permissions: StaffPermissions = isOwner
    ? {
        canManageBookings: true,
        canViewAllBookings: true,
        canManageClients: true,
        canViewAllClients: true,
        canManageServices: true,
        canManageLocations: true,
        canManageTeam: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canViewBusinessBookings: true,
      }
    : ((user as any)?.staffProfile?.permissions || DEFAULT_PERMISSIONS);

  const hasPermission = (permission: keyof StaffPermissions): boolean => {
    if (isOwner) return true;
    return permissions[permission] === true;
  };

  return {
    permissions,
    isOwner,
    hasPermission,
    loading: !user,
  };
}
