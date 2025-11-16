import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { checkProPlan } from '../middleware/checkProPlan';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
  business?: any;
}

// Generate WordPress API keys (POST /api/wordpress/generate)
router.post('/generate', authenticate, checkProPlan, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.business.id;

    // Generate secure API keys
    const publicKey = `pk_${crypto.randomBytes(24).toString('hex')}`;
    const secretKey = `sk_${crypto.randomBytes(32).toString('hex')}`;

    // Store in database
    const wpIntegration = await prisma.wordPressIntegration.upsert({
      where: { businessId },
      update: {
        publicKey,
        secretKey,
        updatedAt: new Date(),
      },
      create: {
        businessId,
        publicKey,
        secretKey,
      },
    });

    res.json({
      keys: {
        publicKey: wpIntegration.publicKey,
        secretKey: wpIntegration.secretKey,
        businessId: businessId,
      },
    });
  } catch (error) {
    console.error('Failed to generate WordPress keys:', error);
    res.status(500).json({ message: 'Failed to generate API keys' });
  }
});

// Get existing WordPress API keys (GET /api/wordpress/keys)
router.get('/keys', authenticate, checkProPlan, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.business.id;

    const wpIntegration = await prisma.wordPressIntegration.findUnique({
      where: { businessId },
    });

    if (!wpIntegration) {
      return res.json({ keys: null });
    }

    return res.json({
      keys: {
        publicKey: wpIntegration.publicKey,
        secretKey: wpIntegration.secretKey,
        businessId: businessId,
      },
    });
  } catch (error) {
    console.error('Failed to fetch WordPress keys:', error);
    return res.status(500).json({ message: 'Failed to fetch API keys' });
  }
});

// Verify WordPress integration authentication (POST /api/wordpress/auth)
router.post('/auth', async (req, res) => {
  try {
    const { publicKey, secretKey, businessId } = req.body;

    if (!publicKey || !secretKey || !businessId) {
      return res.status(400).json({ message: 'Missing required credentials' });
    }

    const wpIntegration = await prisma.wordPressIntegration.findUnique({
      where: { businessId: businessId },
      include: { business: true },
    });

    if (!wpIntegration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    if (wpIntegration.publicKey !== publicKey || wpIntegration.secretKey !== secretKey) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token for WordPress plugin
    const token = jwt.sign(
      {
        businessId: wpIntegration.businessId,
        source: 'wordpress',
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return res.json({
      authenticated: true,
      token,
      business: {
        id: wpIntegration.business.id,
        name: wpIntegration.business.name,
        slug: wpIntegration.business.slug,
      },
    });
  } catch (error) {
    console.error('WordPress auth failed:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
});

// Get bookings for WordPress dashboard (GET /api/wordpress/bookings)
router.get('/bookings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({ message: 'Business ID required' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        businessId: businessId as string,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
      take: 50,
    });

    return res.json({ bookings });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get analytics for WordPress dashboard (GET /api/wordpress/analytics)
router.get('/analytics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({ message: 'Business ID required' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Basic analytics only (not advanced)
    const [totalBookings, totalRevenue, upcomingBookings, completedBookings] = await Promise.all([
      prisma.booking.count({
        where: { businessId: businessId as string },
      }),
      prisma.booking.aggregate({
        where: {
          businessId: businessId as string,
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.count({
        where: {
          businessId: businessId as string,
          startTime: { gte: now },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
      }),
      prisma.booking.count({
        where: {
          businessId: businessId as string,
          status: 'COMPLETED',
          startTime: { gte: startOfMonth },
        },
      }),
    ]);

    return res.json({
      analytics: {
        totalBookings,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        upcomingBookings,
        completedThisMonth: completedBookings,
      },
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Get services list for WordPress (GET /api/wordpress/services)
router.get('/services', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({ message: 'Business ID required' });
    }

    const services = await prisma.service.findMany({
      where: {
        businessId: businessId as string,
        active: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        price: true,
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.json({ services });
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// Get business details for WordPress widget (GET /api/wordpress/business/:businessId)
router.get('/business/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        phone: true,
        address: true,
      },
    });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    return res.json({ business });
  } catch (error) {
    console.error('Failed to fetch business:', error);
    return res.status(500).json({ message: 'Failed to fetch business details' });
  }
});

export default router;
