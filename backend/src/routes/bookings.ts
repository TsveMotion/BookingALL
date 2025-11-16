import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import { cache } from '../lib/redis';
import { sendBookingConfirmationEmail } from '../lib/email';

const router = Router();

// Validation schemas
const createBookingSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
  locationId: z.string().optional(),
  staffId: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['card', 'cash', 'bank_transfer']).optional(),
});

const updateBookingSchema = z.object({
  startTime: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
  staffId: z.string().optional(),
});

// Get all bookings
router.get('/', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { 
      status, 
      paymentStatus, 
      clientId, 
      serviceId,
      locationId,
      staffId,
      startDate,
      endDate,
      limit = '50',
      offset = '0'
    } = req.query;

    const where: any = { businessId };
    
    if (status) where.status = status as string;
    if (paymentStatus) where.paymentStatus = paymentStatus as string;
    if (clientId) where.clientId = clientId as string;
    if (serviceId) where.serviceId = serviceId as string;
    if (locationId) where.locationId = locationId as string;
    if (staffId) where.staffId = staffId as string;
    
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate as string);
      if (endDate) where.startTime.lte = new Date(endDate as string);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          client: true,
          service: true,
          location: true,
          addons: {
            include: {
              addon: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          startTime: 'desc',
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      bookings,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get single booking
router.get('/:id', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        client: true,
        service: true,
        location: true,
        addons: {
          include: {
            addon: {
              select: {
                id: true,
                name: true,
                priceAdjustment: true,
                durationAdjustment: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create booking
router.post('/', authenticate, requireBusiness, validateBody(createBookingSchema), async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const userId = req.user!.userId;
    const { clientId, serviceId, locationId, staffId, startTime, notes, paymentMethod } = req.body;

    // Verify client belongs to business
    const client = await prisma.client.findFirst({
      where: { id: clientId, businessId },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Verify service belongs to business
    const service = await prisma.service.findFirst({
      where: { id: serviceId, businessId },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Calculate end time
    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration * 60000);

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        businessId,
        locationId: locationId || null,
        staffId: staffId || null,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } },
            ],
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } },
            ],
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return res.status(400).json({ 
        error: 'Time slot not available. There is a conflicting booking.' 
      });
    }

    const booking = await prisma.booking.create({
      data: {
        businessId,
        clientId,
        serviceId,
        locationId,
        staffId,
        startTime: start,
        endTime: end,
        totalAmount: service.price,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod || 'cash',
        notes,
        createdById: userId,
      },
      include: {
        client: true,
        service: true,
        location: true,
      },
    });

    // Invalidate cache
    await cache.del(`bookings:${businessId}:*`);
    await cache.del(`business:${businessId}`);

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking
router.patch('/:id', authenticate, requireBusiness, validateBody(updateBookingSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;
    const { startTime, status, paymentStatus, notes, staffId } = req.body;

    // Check if booking exists
    const existingBooking = await prisma.booking.findFirst({
      where: { id, businessId },
      include: { service: true },
    });

    if (!existingBooking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    let endTime = existingBooking.endTime;

    // If start time changed, recalculate end time
    if (startTime) {
      const start = new Date(startTime);
      endTime = new Date(start.getTime() + existingBooking.service.duration * 60000);

      // Check for conflicts
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          id: { not: id },
          businessId,
          locationId: existingBooking.locationId,
          staffId: staffId || existingBooking.staffId,
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          OR: [
            {
              AND: [
                { startTime: { lte: start } },
                { endTime: { gt: start } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
          ],
        },
      });

      if (conflictingBooking) {
        return res.status(400).json({ 
          error: 'Time slot not available. There is a conflicting booking.' 
        });
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: startTime ? endTime : undefined,
        status,
        paymentStatus,
        notes,
        staffId,
      },
      include: {
        client: true,
        service: true,
        location: true,
      },
    });

    // Invalidate cache
    await cache.del(`bookings:${businessId}:*`);
    await cache.del(`business:${businessId}`);

    res.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Cancel booking
router.post('/:id/cancel', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;

    const booking = await prisma.booking.findFirst({
      where: { id, businessId },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        client: true,
        service: true,
      },
    });

    // Invalidate cache
    await cache.del(`bookings:${businessId}:*`);

    res.json(updatedBooking);
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Get availability for a service
router.get('/availability/slots', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { serviceId, date, locationId, staffId } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({ error: 'serviceId and date are required' });
    }

    // Get service
    const service = await prisma.service.findFirst({
      where: { id: serviceId as string, businessId },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Get bookings for the day
    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        locationId: locationId as string || undefined,
        staffId: staffId as string || undefined,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate available time slots (9 AM to 6 PM)
    const slots: { time: string; available: boolean }[] = [];
    const businessStartHour = 9;
    const businessEndHour = 18;

    for (let hour = businessStartHour; hour < businessEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + service.duration * 60000);

        // Check if slot conflicts with any booking
        const hasConflict = bookings.some(booking => {
          return (
            (slotStart >= booking.startTime && slotStart < booking.endTime) ||
            (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
            (slotStart <= booking.startTime && slotEnd >= booking.endTime)
          );
        });

        slots.push({
          time: slotStart.toISOString(),
          available: !hasConflict && slotEnd <= new Date(targetDate.setHours(businessEndHour, 0, 0, 0)),
        });
      }
    }

    res.json({ slots });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Delete booking
router.delete('/:id', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;

    const booking = await prisma.booking.findFirst({
      where: { id, businessId },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await prisma.booking.delete({
      where: { id },
    });

    // Invalidate cache
    await cache.del(`bookings:${businessId}:*`);

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// PUBLIC BOOKING ENDPOINTS (No authentication required)

// Create booking from public booking page
router.post('/public/create', async (req, res: Response) => {
  try {
    const { businessSlug, serviceId, startTime, clientName, clientEmail, clientPhone, notes, paymentMethod } = req.body;

    if (!businessSlug || !serviceId || !startTime || !clientName || !clientEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find business
    const business = await prisma.business.findUnique({
      where: { slug: businessSlug },
      include: {
        services: true,
        owner: true,
      },
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Find service
    const service = business.services.find(s => s.id === serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Find or create client
    let client = await prisma.client.findFirst({
      where: {
        businessId: business.id,
        email: clientEmail,
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          businessId: business.id,
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
        },
      });
    }

    // Calculate end time
    const start = new Date(startTime);
    const end = new Date(start.getTime() + service.duration * 60000);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        businessId: business.id,
        clientId: client.id,
        serviceId: service.id,
        startTime: start,
        endTime: end,
        totalAmount: service.price,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod || 'card',
        notes,
        createdById: business.owner.id,
      },
      include: {
        client: true,
        service: true,
      },
    });

    // Send pending booking email (payment required)
    try {
      await sendBookingConfirmationEmail(client.email, {
        clientName: client.name,
        serviceName: service.name,
        startTime: start,
        businessName: business.name,
        location: business.address ? `${business.address}, ${business.city}` : undefined,
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
      // Don't fail the booking if email fails
    }

    res.json({ booking, id: booking.id });
  } catch (error) {
    console.error('Create public booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get public booking details (for confirmation page)
router.get('/public/:id', async (req, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            name: true,
            duration: true,
            price: true,
          },
        },
        business: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get public booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

export default router;
