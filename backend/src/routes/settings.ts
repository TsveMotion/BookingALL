import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import { cache } from '../lib/redis';
import { hashPassword } from '../lib/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const updateBrandingSchema = z.object({
  primaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  font: z.string().optional(),
});

const updateSEOSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

const updateNotificationsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  bookingReminders: z.boolean().optional(),
  newClientAlerts: z.boolean().optional(),
  marketingUpdates: z.boolean().optional(),
  dailySummary: z.boolean().optional(),
  staffNotifications: z.boolean().optional(),
});

const updateSocialLinksSchema = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().url().optional(),
});

// Helper to check plan features
function requiresPro(plan: string): boolean {
  return plan === 'FREE' || plan === 'STARTER';
}

// GET user profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
        lastLoginAt: true,
        business: {
          select: {
            plan: true,
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH update profile
router.patch('/profile', authenticate, validateBody(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, email, phone } = req.body;

    // Check email uniqueness if changing
    if (email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          NOT: { id: userId }
        }
      });

      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase(), emailVerified: false }),
        ...(phone !== undefined && { phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST change password
router.post('/profile/change-password', authenticate, validateBody(changePasswordSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const { verifyPassword } = await import('../lib/auth');
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// POST upload avatar
router.post('/profile/avatar', authenticate, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Delete old avatar if exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    });

    if (user?.avatar) {
      const oldPath = path.join(process.cwd(), user.avatar);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.log('Old avatar not found or already deleted');
      }
    }

    // Update user avatar
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl }
    });

    res.json({ avatar: updated.avatar });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// GET login activity (Pro only)
router.get('/profile/login-activity', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Check if user has Pro plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: { select: { plan: true } } }
    });

    if (!user || requiresPro(user.business?.plan || 'FREE')) {
      return res.status(403).json({ error: 'This feature requires a Pro plan' });
    }

    const activities = await prisma.loginActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json(activities);
  } catch (error) {
    console.error('Get login activity error:', error);
    res.status(500).json({ error: 'Failed to fetch login activity' });
  }
});

// GET business settings
router.get('/business', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    const settings = await prisma.businessSettings.findUnique({
      where: { businessId },
    });

    // Create if doesn't exist
    if (!settings) {
      const created = await prisma.businessSettings.create({
        data: { businessId }
      });
      return res.json(created);
    }

    res.json(settings);
  } catch (error) {
    console.error('Get business settings error:', error);
    res.status(500).json({ error: 'Failed to fetch business settings' });
  }
});

// PATCH update branding (Pro only)
router.patch('/business/branding', authenticate, requireBusiness, validateBody(updateBrandingSchema), async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    // Check plan
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { plan: true }
    });

    if (!business || requiresPro(business.plan)) {
      return res.status(403).json({ error: 'Branding customization requires a Pro plan' });
    }

    const { primaryColor, accentColor, font } = req.body;

    const settings = await prisma.businessSettings.upsert({
      where: { businessId },
      create: {
        businessId,
        branding: {
          primaryColor,
          accentColor,
          font,
        }
      },
      update: {
        branding: {
          primaryColor,
          accentColor,
          font,
        }
      }
    });

    await cache.del(`business:${businessId}`);

    res.json(settings);
  } catch (error) {
    console.error('Update branding error:', error);
    res.status(500).json({ error: 'Failed to update branding' });
  }
});

// PATCH update SEO (Pro only)
router.patch('/business/seo', authenticate, requireBusiness, validateBody(updateSEOSchema), async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    // Check plan
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { plan: true }
    });

    if (!business || requiresPro(business.plan)) {
      return res.status(403).json({ error: 'SEO settings require a Pro plan' });
    }

    const { metaTitle, metaDescription, keywords } = req.body;

    const settings = await prisma.businessSettings.upsert({
      where: { businessId },
      create: {
        businessId,
        seo: {
          metaTitle,
          metaDescription,
          keywords,
        }
      },
      update: {
        seo: {
          metaTitle,
          metaDescription,
          keywords,
        }
      }
    });

    await cache.del(`business:${businessId}`);

    res.json(settings);
  } catch (error) {
    console.error('Update SEO error:', error);
    res.status(500).json({ error: 'Failed to update SEO settings' });
  }
});

// PATCH update notifications
router.patch('/business/notifications', authenticate, requireBusiness, validateBody(updateNotificationsSchema), async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { plan: true }
    });

    const plan = business?.plan || 'FREE';
    const notifications = req.body;

    // Restrict certain features to Pro
    if (requiresPro(plan)) {
      // Free/Starter only gets basic notifications
      const allowedKeys = ['emailNotifications', 'bookingReminders'];
      Object.keys(notifications).forEach(key => {
        if (!allowedKeys.includes(key)) {
          delete notifications[key];
        }
      });
    }

    const settings = await prisma.businessSettings.upsert({
      where: { businessId },
      create: {
        businessId,
        notifications
      },
      update: {
        notifications
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// PATCH update social links
router.patch('/business/social', authenticate, requireBusiness, validateBody(updateSocialLinksSchema), async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { instagram, facebook, twitter, linkedin, website } = req.body;

    const settings = await prisma.businessSettings.upsert({
      where: { businessId },
      create: {
        businessId,
        socialLinks: {
          instagram,
          facebook,
          twitter,
          linkedin,
          website,
        }
      },
      update: {
        socialLinks: {
          instagram,
          facebook,
          twitter,
          linkedin,
          website,
        }
      }
    });

    // Also update business website
    if (website) {
      await prisma.business.update({
        where: { id: businessId },
        data: { website }
      });
    }

    await cache.del(`business:${businessId}`);

    res.json(settings);
  } catch (error) {
    console.error('Update social links error:', error);
    res.status(500).json({ error: 'Failed to update social links' });
  }
});

export default router;
