import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schema - flexible to accept all possible fields
const updateBookingPageSchema = z.object({
  enabled: z.boolean().optional(),
  primaryColor: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  heroTitle: z.string().optional().nullable(),
  heroDescription: z.string().optional().nullable(),
  welcomeMessage: z.string().optional().nullable(),
  thankYouMessage: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  openingHours: z.any().optional().nullable(),
  requireDeposit: z.boolean().optional(),
  depositPercent: z.number().min(0).max(100).optional().nullable(),
  allowOnlinePayment: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  cancellationPolicy: z.string().optional().nullable(),
  cancellationHours: z.number().min(0).optional().nullable(),
  visibleServiceIds: z.array(z.string()).optional().nullable(),
  galleryImages: z.array(z.string()).optional().nullable(),
  socialLinks: z.any().optional().nullable(),
}).passthrough();

// Get booking page settings for authenticated business
router.get('/me', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    let bookingPage = await prisma.bookingPageSettings.findUnique({
      where: { businessId },
    });

    // Create default if doesn't exist
    if (!bookingPage) {
      const business = await prisma.business.findUnique({
        where: { id: businessId },
      });

      bookingPage = await prisma.bookingPageSettings.create({
        data: {
          businessId,
          enabled: true,
          heroTitle: `Book an appointment with ${business?.name}`,
          heroDescription: `Experience premium beauty treatments at ${business?.name}. Book your appointment online in just a few clicks.`,
        },
      });
    }

    res.json(bookingPage);
  } catch (error) {
    console.error('Get booking page error:', error);
    res.status(500).json({ error: 'Failed to fetch booking page settings' });
  }
});

// Get public booking page by slug (NO AUTH REQUIRED)
router.get('/public/:slug', async (req, res: Response) => {
  try {
    const { slug } = req.params;

    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        bookingPage: true,
        services: {
          where: { active: true },
          orderBy: { name: 'asc' },
        },
        staff: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            avatar: true,
            bio: true,
            skills: true,
          },
        },
      },
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Auto-create booking page if it doesn't exist
    let bookingPage = business.bookingPage;
    if (!bookingPage) {
      bookingPage = await prisma.bookingPageSettings.create({
        data: {
          businessId: business.id,
          enabled: true,
          heroTitle: `Book an appointment with ${business.name}`,
          heroDescription: `Experience premium beauty treatments at ${business.name}. Book your appointment online in just a few clicks.`,
        },
      });
    }

    // Check if booking page is explicitly disabled (don't block if just null/undefined)
    if (bookingPage.enabled === false) {
      return res.status(403).json({ 
        error: 'Booking page is not enabled',
        disabled: true 
      });
    }

    // Filter services based on visibility settings
    let visibleServices = business.services;
    if (bookingPage.visibleServiceIds && bookingPage.visibleServiceIds.length > 0) {
      visibleServices = business.services.filter(s =>
        bookingPage!.visibleServiceIds.includes(s.id)
      );
    }

    res.json({
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        category: business.category,
        description: business.description,
        logo: business.logo,
        email: business.email,
        phone: business.phone,
        address: business.address,
        city: business.city,
        postcode: business.postcode,
      },
      bookingPage: bookingPage,
      services: visibleServices,
      staff: business.staff || [],
    });
  } catch (error) {
    console.error('Get public booking page error:', error);
    res.status(500).json({ error: 'Failed to fetch booking page' });
  }
});

// Update booking page settings
router.patch('/', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const data = req.body;

    console.log('PATCH booking-page request:', { businessId, data });

    // Remove undefined/null values to avoid DB issues
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    console.log('Clean data:', cleanData);

    // Check if booking page exists
    let bookingPage = await prisma.bookingPageSettings.findUnique({
      where: { businessId },
    });

    if (bookingPage) {
      // Update existing
      bookingPage = await prisma.bookingPageSettings.update({
        where: { businessId },
        data: cleanData,
      });
    } else {
      // Create new
      bookingPage = await prisma.bookingPageSettings.create({
        data: {
          businessId,
          ...data,
        },
      });
    }

    res.json(bookingPage);
  } catch (error) {
    console.error('Update booking page error:', error);
    res.status(500).json({ error: 'Failed to update booking page settings' });
  }
});

// Upload logo/images endpoint (simplified - in production use proper file upload service)
router.post('/upload', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const { imageUrl, type } = req.body; // type: 'logo' | 'cover' | 'gallery'

    if (!imageUrl || !type) {
      return res.status(400).json({ error: 'Image URL and type are required' });
    }

    const businessId = req.user!.businessId!;

    let bookingPage = await prisma.bookingPageSettings.findUnique({
      where: { businessId },
    });

    if (!bookingPage) {
      bookingPage = await prisma.bookingPageSettings.create({
        data: { businessId },
      });
    }

    // Update based on type
    if (type === 'logo') {
      bookingPage = await prisma.bookingPageSettings.update({
        where: { businessId },
        data: { logo: imageUrl },
      });
    } else if (type === 'cover') {
      bookingPage = await prisma.bookingPageSettings.update({
        where: { businessId },
        data: { coverImage: imageUrl },
      });
    } else if (type === 'gallery') {
      const currentImages = bookingPage.galleryImages || [];
      bookingPage = await prisma.bookingPageSettings.update({
        where: { businessId },
        data: {
          galleryImages: [...currentImages, imageUrl],
        },
      });
    }

    res.json({ success: true, url: imageUrl, bookingPage });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get availability for public booking
router.get('/public/:slug/availability', async (req, res: Response) => {
  try {
    const { slug } = req.params;
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({ error: 'serviceId and date are required' });
    }

    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        services: {
          where: { id: serviceId as string, active: true },
        },
      },
    });

    if (!business || business.services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = business.services[0];

    // Get bookings for the day
    const targetDate = new Date(date as string);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const bookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
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

        // Only show slots for today onwards
        const now = new Date();
        const isInFuture = slotStart > now;

        slots.push({
          time: slotStart.toISOString(),
          available: !hasConflict && isInFuture && slotEnd <= new Date(targetDate.setHours(businessEndHour, 0, 0, 0)),
        });
      }
    }

    res.json({ slots });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;
