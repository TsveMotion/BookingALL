export interface StaffPermissions {
  canManageBookings: boolean;
  canViewAllBookings: boolean;
  canManageClients: boolean;
  canViewAllClients: boolean;
  canManageServices: boolean;
  canManageLocations: boolean;
  canManageTeam: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canViewBusinessBookings: boolean;
}

export const DEFAULT_PERMISSIONS: StaffPermissions = {
  canManageBookings: false,
  canViewAllBookings: false,
  canManageClients: false,
  canViewAllClients: false,
  canManageServices: false,
  canManageLocations: false,
  canManageTeam: false,
  canViewAnalytics: false,
  canManageSettings: false,
  canViewBusinessBookings: false,
};

export const MANAGER_PERMISSIONS: StaffPermissions = {
  canManageBookings: true,
  canViewAllBookings: true,
  canManageClients: true,
  canViewAllClients: true,
  canManageServices: true,
  canManageLocations: false,
  canManageTeam: true,
  canViewAnalytics: true,
  canManageSettings: false,
  canViewBusinessBookings: true,
};

export const OWNER_PERMISSIONS: StaffPermissions = {
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
};

export function parsePermissions(permissions: any): StaffPermissions {
  if (typeof permissions === 'string') {
    try {
      permissions = JSON.parse(permissions);
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  }
  
  return {
    ...DEFAULT_PERMISSIONS,
    ...permissions,
  };
}

export function hasPermission(userPermissions: StaffPermissions | any, requiredPermission: keyof StaffPermissions): boolean {
  const perms = parsePermissions(userPermissions);
  return perms[requiredPermission] === true;
}
