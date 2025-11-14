import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';

const router = Router();

// Get analytics data
router.get('/', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { period = 'month' } = req.query;

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    // Current period stats
    const [currentRevenue, currentBookings, currentClients] = await Promise.all([
      prisma.booking.aggregate({
        where: {
          businessId,
          paymentStatus: 'PAID',
          createdAt: { gte: startDate },
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.count({
        where: {
          businessId,
          createdAt: { gte: startDate },
        },
      }),
      prisma.client.count({
        where: {
          businessId,
          createdAt: { gte: startDate },
        },
      }),
    ]);

    // Previous period stats for growth calculation
    const [previousRevenue, previousBookings, previousClients] = await Promise.all([
      prisma.booking.aggregate({
        where: {
          businessId,
          paymentStatus: 'PAID',
          createdAt: { gte: previousStartDate, lt: startDate },
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.count({
        where: {
          businessId,
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
      prisma.client.count({
        where: {
          businessId,
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      }),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const revenueTotal = currentRevenue._sum.totalAmount || 0;
    const revenuePrevious = previousRevenue._sum.totalAmount || 0;
    const avgBookingValue = currentBookings > 0 ? revenueTotal / currentBookings : 0;

    res.json({
      revenue: {
        total: revenueTotal,
        growth: calculateGrowth(revenueTotal, revenuePrevious),
      },
      bookings: {
        total: currentBookings,
        growth: calculateGrowth(currentBookings, previousBookings),
      },
      clients: {
        total: currentClients,
        growth: calculateGrowth(currentClients, previousClients),
      },
      avgBookingValue: Number(avgBookingValue.toFixed(2)),
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get top services
router.get('/top-services', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { limit = '5' } = req.query;

    const topServices = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: { businessId },
      _count: { serviceId: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: parseInt(limit as string),
    });

    const servicesWithDetails = await Promise.all(
      topServices.map(async (item) => {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId },
          select: { id: true, name: true, price: true },
        });
        return {
          service,
          bookings: item._count.serviceId,
          revenue: item._sum.totalAmount || 0,
        };
      })
    );

    res.json(servicesWithDetails);
  } catch (error) {
    console.error('Get top services error:', error);
    res.status(500).json({ error: 'Failed to fetch top services' });
  }
});

export default router;
