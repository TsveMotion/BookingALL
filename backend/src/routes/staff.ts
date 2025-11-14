import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { sendStaffInviteEmail } from '../lib/email';
import { config } from '../config';
import { DEFAULT_PERMISSIONS } from '../types/permissions';
import bcrypt from 'bcryptjs';

const router = Router();

// Validation schemas
const inviteStaffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.string().optional(),
  assignedLocationIds: z.array(z.string()).optional().default([]),
  permissions: z.object({
    canManageBookings: z.boolean().optional().default(false),
    canViewAllBookings: z.boolean().optional().default(false),
    canManageClients: z.boolean().optional().default(false),
    canViewAllClients: z.boolean().optional().default(false),
    canManageServices: z.boolean().optional().default(false),
    canManageLocations: z.boolean().optional().default(false),
    canManageTeam: z.boolean().optional().default(false),
    canViewAnalytics: z.boolean().optional().default(false),
    canManageSettings: z.boolean().optional().default(false),
    canViewBusinessBookings: z.boolean().optional().default(false),
  }).optional(),
});

const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  assignedLocationIds: z.array(z.string()).optional(),
  permissions: z.object({
    canManageBookings: z.boolean().optional(),
    canViewAllBookings: z.boolean().optional(),
    canManageClients: z.boolean().optional(),
    canViewAllClients: z.boolean().optional(),
    canManageServices: z.boolean().optional(),
    canManageLocations: z.boolean().optional(),
    canManageTeam: z.boolean().optional(),
    canViewAnalytics: z.boolean().optional(),
    canManageSettings: z.boolean().optional(),
    canViewBusinessBookings: z.boolean().optional(),
  }).optional(),
  active: z.boolean().optional(),
});

const acceptInviteSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

// Get all staff for authenticated business
router.get('/', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    const staff = await prisma.staff.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    return res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Invite new staff member
router.post('/invite', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const userId = req.user!.userId;
    
    // Validate input
    const data = inviteStaffSchema.parse(req.body);

    // Get business plan
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { plan: true, name: true },
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Count existing staff
    const staffCount = await prisma.staff.count({
      where: { businessId },
    });

    // Enforce limits based on plan
    // FREE and STARTER plans allow ONLY 1 staff member (the owner)
    // No additional staff can be added
    if (business.plan === 'FREE' && staffCount >= 1) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: 'Free plan allows only 1 staff member (the owner). Upgrade to Pro to add team members.',
        limit: 1,
        current: staffCount,
      });
    }

    if (business.plan === 'STARTER' && staffCount >= 1) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: 'Starter plan allows only 1 staff member (the owner). Upgrade to Pro to add team members.',
        limit: 1,
        current: staffCount,
      });
    }

    // Check if staff with this email already exists
    const existingStaff = await prisma.staff.findUnique({
      where: {
        businessId_email: {
          businessId,
          email: data.email,
        },
      },
    });

    if (existingStaff) {
      return res.status(400).json({ error: 'Staff member with this email already exists' });
    }

    // Validate assigned locations
    if (data.assignedLocationIds && data.assignedLocationIds.length > 0) {
      const locations = await prisma.location.findMany({
        where: {
          id: { in: data.assignedLocationIds },
          businessId,
        },
      });

      if (locations.length !== data.assignedLocationIds.length) {
        return res.status(400).json({ error: 'One or more invalid locations' });
      }
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Create staff invite
    const invite = await prisma.staffInvite.create({
      data: {
        businessId,
        email: data.email,
        name: data.name,
        role: data.role,
        assignedLocationIds: data.assignedLocationIds,
        permissions: data.permissions || DEFAULT_PERMISSIONS,
        token,
        expiresAt,
        createdById: userId,
      },
    });

    // Create staff record with pending status
    // Note: status field will be added after migration
    await prisma.staff.create({
      data: {
        businessId,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        assignedLocationIds: data.assignedLocationIds,
        permissions: data.permissions || DEFAULT_PERMISSIONS,
        inviteAccepted: false,
      },
    });

    // Get inviter name
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Send invitation email
    const inviteUrl = `${config.frontendUrls.beauticians}/auth/accept-invite?token=${token}`;
    
    try {
      await sendStaffInviteEmail(data.email, {
        staffName: data.name,
        businessName: business.name,
        role: data.role,
        inviteUrl,
        inviterName: inviter?.name,
      });
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError);
      // Don't fail the whole request if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Staff invitation sent successfully',
      invite: {
        id: invite.id,
        email: invite.email,
        name: invite.name,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Invite staff error:', error);
    return res.status(500).json({ error: 'Failed to invite staff member' });
  }
});

// Accept staff invitation (no auth required)
router.post('/accept-invite', async (req, res: Response) => {
  try {
    const data = acceptInviteSchema.parse(req.body);

    // Find invite
    const invite = await prisma.staffInvite.findUnique({
      where: { token: data.token },
      include: { business: true },
    });

    if (!invite) {
      return res.status(404).json({ error: 'Invalid invitation token' });
    }

    if (invite.used) {
      return res.status(400).json({ error: 'This invitation has already been used' });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ error: 'This invitation has expired' });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: invite.email },
    });

    if (user) {
      // Link existing user to business
      await prisma.user.update({
        where: { id: user.id },
        data: {
          businessId: invite.businessId,
          role: 'STAFF',
        },
      });
    } else {
      // Create new user
      const passwordHash = await bcrypt.hash(data.password, 12);
      user = await prisma.user.create({
        data: {
          email: invite.email,
          name: data.name || invite.name,
          passwordHash,
          role: 'STAFF',
          businessId: invite.businessId,
          emailVerified: true, // Auto-verify since they used invite link
        },
      });
    }

    // Check if staff record already exists (created during invite)
    let staff = await prisma.staff.findFirst({
      where: {
        businessId: invite.businessId,
        email: invite.email,
      },
    });

    if (staff) {
      // Update existing staff record
      staff = await prisma.staff.update({
        where: { id: staff.id },
        data: {
          userId: user.id,
          name: data.name || invite.name,
          inviteAccepted: true,
        },
      });
    } else {
      // Create new staff record if it doesn't exist
      staff = await prisma.staff.create({
        data: {
          businessId: invite.businessId,
          userId: user.id,
          email: invite.email,
          name: data.name || invite.name,
          phone: invite.role,
          role: invite.role,
          assignedLocationIds: invite.assignedLocationIds,
          permissions: invite.permissions,
          active: true,
          inviteAccepted: true,
        },
      });
    }

    // Mark invite as used
    await prisma.staffInvite.update({
      where: { id: invite.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: 'Invitation accepted successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      staff: {
        id: staff.id,
        role: staff.role,
      },
      business: {
        id: invite.business.id,
        name: invite.business.name,
        slug: invite.business.slug,
      },
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Accept invite error:', error);
    return res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Resend invitation
router.post('/:id/resend-invite', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { id } = req.params;

    // Get staff member
    const staff = await prisma.staff.findFirst({
      where: { id, businessId },
      include: { business: true },
    });

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    if (staff.inviteAccepted) {
      return res.status(400).json({ error: 'Staff member has already accepted the invitation' });
    }

    // Find existing invite
    const existingInvite = await prisma.staffInvite.findFirst({
      where: {
        businessId,
        email: staff.email,
        used: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    let token: string;
    let expiresAt: Date;

    if (existingInvite && existingInvite.expiresAt > new Date()) {
      // Reuse existing invite
      token = existingInvite.token;
      expiresAt = existingInvite.expiresAt;
    } else {
      // Create new invite
      token = randomBytes(32).toString('hex');
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await prisma.staffInvite.create({
        data: {
          businessId,
          email: staff.email,
          name: staff.name,
          role: staff.role,
          assignedLocationIds: staff.assignedLocationIds,
          permissions: staff.permissions,
          token,
          expiresAt,
          createdById: req.user!.userId,
        },
      });
    }

    // Send email
    const inviteUrl = `${config.frontendUrls.beauticians}/auth/accept-invite?token=${token}`;
    
    await sendStaffInviteEmail(staff.email, {
      staffName: staff.name,
      businessName: staff.business.name,
      role: staff.role,
      inviteUrl,
    });

    return res.json({
      success: true,
      message: 'Invitation resent successfully',
    });
  } catch (error) {
    console.error('Resend invite error:', error);
    return res.status(500).json({ error: 'Failed to resend invitation' });
  }
});

// Update staff member
router.patch('/:id', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { id } = req.params;
    
    const data = updateStaffSchema.parse(req.body);

    // Verify staff belongs to business
    const existing = await prisma.staff.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Validate assigned locations if provided
    if (data.assignedLocationIds && data.assignedLocationIds.length > 0) {
      const locations = await prisma.location.findMany({
        where: {
          id: { in: data.assignedLocationIds },
          businessId,
        },
      });

      if (locations.length !== data.assignedLocationIds.length) {
        return res.status(400).json({ error: 'One or more invalid locations' });
      }
    }

    // Update staff member
    const staff = await prisma.staff.update({
      where: { id },
      data: {
        ...data,
        permissions: data.permissions ? { ...existing.permissions, ...data.permissions } : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json(staff);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Update staff error:', error);
    return res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// Delete staff member
router.delete('/:id', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { id } = req.params;

    // Verify staff belongs to business
    const existing = await prisma.staff.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Delete staff member
    await prisma.staff.delete({
      where: { id },
    });

    // Optionally remove business association from user
    if (existing.userId) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { businessId: null, role: 'OWNER' },
      });
    }

    return res.json({ success: true, message: 'Staff member removed successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    return res.status(500).json({ error: 'Failed to remove staff member' });
  }
});

export default router;
