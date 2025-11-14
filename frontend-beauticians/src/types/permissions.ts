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

export const PERMISSION_LABELS: Record<keyof StaffPermissions, { label: string; description: string }> = {
  canManageBookings: {
    label: 'Manage Own Bookings',
    description: 'Create, update, and cancel their own bookings',
  },
  canViewAllBookings: {
    label: 'View All Bookings',
    description: 'See bookings for all staff members',
  },
  canManageClients: {
    label: 'Manage Clients',
    description: 'Add, edit, and manage client information',
  },
  canViewAllClients: {
    label: 'View All Clients',
    description: 'See all business clients (not just their own)',
  },
  canManageServices: {
    label: 'Manage Services',
    description: 'Create, edit, and delete services',
  },
  canManageLocations: {
    label: 'Manage Locations',
    description: 'Add, edit, and manage business locations',
  },
  canManageTeam: {
    label: 'Manage Team',
    description: 'Invite, edit, and remove staff members',
  },
  canViewAnalytics: {
    label: 'View Analytics',
    description: 'Access analytics and reports',
  },
  canManageSettings: {
    label: 'Manage Settings',
    description: 'Change business settings and configuration',
  },
  canViewBusinessBookings: {
    label: 'View Business Analytics',
    description: 'See total business bookings and revenue',
  },
};
