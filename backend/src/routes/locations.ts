import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Validation schema
const createLocationSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  phone: z.string().optional(),
  workingHours: z.any().optional(),
  isPrimary: z.boolean().optional(),
});

const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  phone: z.string().optional(),
  workingHours: z.any().optional(),
  isPrimary: z.boolean().optional(),
  active: z.boolean().optional(),
});

// Get all locations for authenticated business
router.get('/', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    const locations = await prisma.location.findMany({
      where: { businessId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });

    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Create new location with plan limits
router.post('/', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const data = req.body;

    // Get business plan
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { plan: true },
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Count existing locations
    const locationCount = await prisma.location.count({
      where: { businessId },
    });

    // Enforce limits based on plan
    // FREE and STARTER: Max 1 location
    // PRO: Unlimited locations
    if (business.plan === 'FREE' && locationCount >= 1) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: 'Free plan allows only 1 location. Upgrade to Pro for unlimited locations.',
        limit: 1,
        current: locationCount,
      });
    }

    if (business.plan === 'STARTER' && locationCount >= 1) {
      return res.status(403).json({
        error: 'Upgrade required',
        message: 'Starter plan allows only 1 location. Upgrade to Pro for unlimited locations.',
        limit: 1,
        current: locationCount,
      });
    }

    // PRO plan has no location limits

    // Validate data
    const parsed = createLocationSchema.parse(data);

    // Create location
    const location = await prisma.location.create({
      data: {
        businessId,
        ...parsed,
      },
    });

    res.status(201).json(location);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Update location
router.patch('/:id', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { id } = req.params;
    const data = req.body;

    // Verify location belongs to business
    const existing = await prisma.location.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Validate data
    const parsed = updateLocationSchema.parse(data);

    // Update location
    const location = await prisma.location.update({
      where: { id },
      data: parsed,
    });

    res.json(location);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete location
router.delete('/:id', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { id } = req.params;

    // Verify location belongs to business
    const existing = await prisma.location.findFirst({
      where: { id, businessId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Delete location
    await prisma.location.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

export default router;
