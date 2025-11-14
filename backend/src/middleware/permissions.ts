import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../lib/prisma';
import { StaffPermissions, parsePermissions } from '../types/permissions';

export interface PermissionRequest extends AuthRequest {
  permissions?: StaffPermissions;
  isOwner?: boolean;
  staffId?: string;
}

// Middleware to load user permissions
export async function loadPermissions(req: PermissionRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const businessId = req.user?.businessId;

    if (!userId || !businessId) {
      return next();
    }

    // Check if user is the business owner
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });

    if (business && business.ownerId === userId) {
      req.isOwner = true;
      req.permissions = {
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
      return next();
    }

    // Load staff permissions
    const staff = await prisma.staff.findFirst({
      where: {
        userId,
        businessId,
        active: true,
      },
      select: {
        id: true,
        permissions: true,
      },
    });

    if (staff) {
      req.staffId = staff.id;
      req.permissions = parsePermissions(staff.permissions);
      req.isOwner = false;
    }

    next();
  } catch (error) {
    console.error('Load permissions error:', error);
    next();
  }
}

// Permission check middleware factory
export function requirePermission(permission: keyof StaffPermissions) {
  return (req: PermissionRequest, res: Response, next: NextFunction) => {
    // Owner always has all permissions
    if (req.isOwner) {
      return next();
    }

    // Check if user has the required permission
    if (!req.permissions || !req.permissions[permission]) {
      return res.status(403).json({
        error: 'Permission denied',
        message: `You do not have permission to ${permission.replace('can', '').toLowerCase()}`,
        requiredPermission: permission,
      });
    }

    next();
  };
}

// Check if user is owner
export function requireOwner(req: PermissionRequest, res: Response, next: NextFunction) {
  if (!req.isOwner) {
    return res.status(403).json({
      error: 'Owner access required',
      message: 'Only the business owner can perform this action',
    });
  }
  next();
}

// Helper function to check permission programmatically
export function hasPermission(req: PermissionRequest, permission: keyof StaffPermissions): boolean {
  if (req.isOwner) return true;
  return req.permissions?.[permission] === true;
}
