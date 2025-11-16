import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';

const router = Router();

// Get analytics overview (alias for main endpoint)
router.get('/overview', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { period = 'month' } = req.query;

    // Return basic stats for dashboard
    const [revenue, bookings, clients] = await Promise.all([
      prisma.booking.aggregate({
        where: { businessId, paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.booking.count({ where: { businessId } }),
      prisma.client.count({ where: { businessId } }),
    ]);

    res.json({
      revenue: { total: revenue._sum.totalAmount || 0, growth: 0 },
      bookings: { total: bookings, growth: 0 },
      clients: { total: clients, growth: 0 },
      avgBookingValue: bookings > 0 ? (revenue._sum.totalAmount || 0) / bookings : 0,
    });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

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
    const [currentRevenue, currentBookings, currentClients, completedBookings, cancelledBookings] = await Promise.all([
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
      prisma.booking.count({
        where: {
          businessId,
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      }),
      prisma.booking.count({
        where: {
          businessId,
          status: 'CANCELLED',
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

    // Get top services
    const topServicesData = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: {
        businessId,
        createdAt: { gte: startDate },
      },
      _count: { serviceId: true },
      _sum: { totalAmount: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: 5,
    });

    const topServices = await Promise.all(
      topServicesData.map(async (item) => {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId },
          select: { name: true, category: true },
        });
        return {
          name: service?.name || 'Unknown Service',
          bookings: item._count.serviceId,
          revenue: item._sum.totalAmount || 0,
        };
      })
    );

    // Revenue breakdown by service category
    const serviceRevenue = await prisma.booking.findMany({
      where: {
        businessId,
        paymentStatus: 'PAID',
        createdAt: { gte: startDate },
      },
      include: {
        service: {
          select: { category: true },
        },
      },
    });

    const revenueByCategory: { [key: string]: number } = {};
    serviceRevenue.forEach((booking) => {
      const category = booking.service?.category || 'Other';
      revenueByCategory[category] = (revenueByCategory[category] || 0) + booking.totalAmount;
    });

    const revenueByService = Object.entries(revenueByCategory)
      .map(([service, amount]) => ({
        service,
        amount,
        percentage: revenueTotal > 0 ? Math.round((amount / revenueTotal) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Client retention - clients with more than one booking
    const clientBookingCounts = await prisma.booking.groupBy({
      by: ['clientId'],
      where: {
        businessId,
        createdAt: { gte: startDate },
      },
      _count: { clientId: true },
    });

    const returningClients = clientBookingCounts.filter((c) => c._count.clientId > 1).length;
    const oneTimeClients = clientBookingCounts.filter((c) => c._count.clientId === 1).length;
    const totalClientsWithBookings = clientBookingCounts.length;
    const retentionRate = totalClientsWithBookings > 0
      ? Math.round((returningClients / totalClientsWithBookings) * 100)
      : 0;

    // New vs returning clients in period
    const newClients = await prisma.client.count({
      where: {
        businessId,
        createdAt: { gte: startDate },
      },
    });

    res.json({
      revenue: {
        total: revenueTotal,
        growth: calculateGrowth(revenueTotal, revenuePrevious),
      },
      bookings: {
        total: currentBookings,
        growth: calculateGrowth(currentBookings, previousBookings),
        completed: completedBookings,
        cancelled: cancelledBookings,
      },
      clients: {
        total: currentClients,
        growth: calculateGrowth(currentClients, previousClients),
        new: newClients,
        returning: returningClients,
      },
      avgBookingValue: Number(avgBookingValue.toFixed(2)),
      topServices,
      revenueByService,
      clientRetention: {
        rate: retentionRate,
        returning: returningClients,
        oneTime: oneTimeClients,
      },
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
