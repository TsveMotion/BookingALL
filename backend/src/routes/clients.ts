import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import { cache } from '../lib/redis';

const router = Router();

// Validation schemas
const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  locationId: z.string().optional(),
});

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  locationId: z.string().optional(),
});

// Get all clients
router.get('/', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { search, locationId, limit = '50', offset = '0' } = req.query;

    const where: any = { businessId };
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
      ];
    }
    
    if (locationId) {
      where.locationId = locationId as string;
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      clients,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client
router.get('/:id', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;

    const client = await prisma.client.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        bookings: {
          include: {
            service: true,
            location: true,
          },
          orderBy: {
            startTime: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create client
router.post('/', authenticate, requireBusiness, validateBody(createClientSchema), async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { name, email, phone, birthday, notes, tags, locationId } = req.body;

    // Check if client with email already exists for this business
    const existingClient = await prisma.client.findFirst({
      where: {
        businessId,
        email,
      },
    });

    if (existingClient) {
      return res.status(400).json({ error: 'Client with this email already exists' });
    }

    const client = await prisma.client.create({
      data: {
        businessId,
        name,
        email,
        phone,
        birthday: birthday ? new Date(birthday) : null,
        notes,
        tags: tags || [],
        locationId,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
router.patch('/:id', authenticate, requireBusiness, validateBody(updateClientSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;
    const { name, email, phone, birthday, notes, tags, locationId } = req.body;

    // Check if client exists
    const existingClient = await prisma.client.findFirst({
      where: { id, businessId },
    });

    if (!existingClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // If email is being updated, check for duplicates
    if (email && email !== existingClient.email) {
      const duplicateClient = await prisma.client.findFirst({
        where: {
          businessId,
          email,
          id: { not: id },
        },
      });

      if (duplicateClient) {
        return res.status(400).json({ error: 'Client with this email already exists' });
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        birthday: birthday ? new Date(birthday) : undefined,
        notes,
        tags,
        locationId,
      },
    });

    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/:id', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;

    // Check if client exists
    const client = await prisma.client.findFirst({
      where: { id, businessId },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Check if client has bookings
    const bookingCount = await prisma.booking.count({
      where: { clientId: id },
    });

    if (bookingCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete client with existing bookings. Archive them instead.' 
      });
    }

    await prisma.client.delete({
      where: { id },
    });

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Get client stats
router.get('/:id/stats', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;

    // Verify client belongs to business
    const client = await prisma.client.findFirst({
      where: { id, businessId },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const [totalBookings, completedBookings, totalSpent, lastBooking] = await Promise.all([
      prisma.booking.count({
        where: { clientId: id },
      }),
      prisma.booking.count({
        where: { 
          clientId: id,
          status: 'COMPLETED',
        },
      }),
      prisma.booking.aggregate({
        where: { 
          clientId: id,
          paymentStatus: 'PAID',
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.booking.findFirst({
        where: { clientId: id },
        orderBy: { startTime: 'desc' },
        include: {
          service: true,
        },
      }),
    ]);

    res.json({
      totalBookings,
      completedBookings,
      totalSpent: totalSpent._sum.totalAmount || 0,
      lastBooking,
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({ error: 'Failed to fetch client stats' });
  }
});

export default router;
