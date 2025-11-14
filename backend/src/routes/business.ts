import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { cache } from '../lib/redis';

const router = Router();

// Helper function to generate unique slug
async function generateUniqueSlug(businessName: string): Promise<string> {
  const baseSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
  
  // Add random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const slug = `${baseSlug}-${randomSuffix}`;
  
  // Check if exists
  const existing = await prisma.business.findUnique({ where: { slug } });
  if (existing) {
    return generateUniqueSlug(businessName); // Try again
  }
  
  return slug;
}

// Get business details
router.get('/', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    // Try cache first
    const cacheKey = `business:${businessId}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    let business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        _count: {
          select: {
            users: true,
            locations: true,
            services: true,
            clients: true,
            bookings: true,
          },
        },
      },
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Auto-generate slug if missing
    if (!business.slug) {
      const newSlug = await generateUniqueSlug(business.name);
      business = await prisma.business.update({
        where: { id: businessId },
        data: { slug: newSlug },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true,
            },
          },
          _count: {
            select: {
              users: true,
              locations: true,
              services: true,
              clients: true,
              bookings: true,
            },
          },
        },
      });
    }

    // Cache for 5 minutes
    await cache.set(cacheKey, business, 300);

    res.json(business);
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// Update business
router.patch('/', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { name, description, email, phone, website, address, city, postcode, logo } = req.body;

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        name,
        description,
        email,
        phone,
        website,
        address,
        city,
        postcode,
        logo,
      },
    });

    // Invalidate cache
    await cache.del(`business:${businessId}`);

    res.json(business);
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// Get business stats
router.get('/stats', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    const [
      totalBookings,
      totalClients,
      totalRevenue,
      pendingBookings,
      completedBookings,
    ] = await Promise.all([
      prisma.booking.count({
        where: { businessId },
      }),
      prisma.client.count({
        where: { businessId },
      }),
      prisma.booking.aggregate({
        where: {
          businessId,
          paymentStatus: 'PAID',
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.booking.count({
        where: {
          businessId,
          status: 'PENDING',
        },
      }),
      prisma.booking.count({
        where: {
          businessId,
          status: 'COMPLETED',
        },
      }),
    ]);

    res.json({
      totalBookings,
      totalClients,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingBookings,
      completedBookings,
    });
  } catch (error) {
    console.error('Get business stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Update business details (name, category, description)
router.patch('/details', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { name, category, description } = req.body;

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        name,
        category,
        description,
      },
    });

    // Invalidate cache
    await cache.del(`business:${businessId}`);

    return res.json(business);
  } catch (error) {
    console.error('Update business details error:', error);
    return res.status(500).json({ error: 'Failed to update business details' });
  }
});

// Update business settings (notification preferences)
router.patch('/settings', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { settings } = req.body;

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        settings,
      },
    });

    // Invalidate cache
    await cache.del(`business:${businessId}`);

    return res.json({ success: true, settings: business.settings });
  } catch (error) {
    console.error('Update business settings error:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
