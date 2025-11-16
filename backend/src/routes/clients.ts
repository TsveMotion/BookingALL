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
  phone: z.string().nullish().transform(val => val || null),
  birthday: z.string().nullish().transform(val => val || null),
  address: z.string().nullish().transform(val => val || null),
  occupation: z.string().nullish().transform(val => val || null),
  referralSource: z.string().nullish().transform(val => val || null),
  emergencyContact: z.string().nullish().transform(val => val || null),
  emergencyPhone: z.string().nullish().transform(val => val || null),
  allergies: z.string().nullish().transform(val => val || null),
  medicalConditions: z.string().nullish().transform(val => val || null),
  skinType: z.string().nullish().transform(val => val || null),
  preferences: z.string().nullish().transform(val => val || null),
  notes: z.string().nullish().transform(val => val || null),
  internalNotes: z.string().nullish().transform(val => val || null),
  tags: z.array(z.string()).optional().default([]),
  marketingConsent: z.boolean().optional().default(false),
  smsConsent: z.boolean().optional().default(false),
  emailConsent: z.boolean().optional().default(false),
  vipStatus: z.boolean().optional().default(false),
  status: z.string().optional().default('active'),
});

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().nullish().transform(val => val || null),
  birthday: z.string().nullish().transform(val => val || null),
  address: z.string().nullish().transform(val => val || null),
  occupation: z.string().nullish().transform(val => val || null),
  referralSource: z.string().nullish().transform(val => val || null),
  emergencyContact: z.string().nullish().transform(val => val || null),
  emergencyPhone: z.string().nullish().transform(val => val || null),
  allergies: z.string().nullish().transform(val => val || null),
  medicalConditions: z.string().nullish().transform(val => val || null),
  skinType: z.string().nullish().transform(val => val || null),
  preferences: z.string().nullish().transform(val => val || null),
  notes: z.string().nullish().transform(val => val || null),
  internalNotes: z.string().nullish().transform(val => val || null),
  tags: z.array(z.string()).optional(),
  marketingConsent: z.boolean().optional(),
  smsConsent: z.boolean().optional(),
  emailConsent: z.boolean().optional(),
  vipStatus: z.boolean().optional(),
  status: z.string().optional(),
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
    const { 
      name, email, phone, birthday, address, occupation, referralSource,
      emergencyContact, emergencyPhone, allergies, medicalConditions, 
      skinType, preferences, notes, internalNotes, tags, 
      marketingConsent, smsConsent, emailConsent, vipStatus, status 
    } = req.body;

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
        address,
        occupation,
        referralSource,
        emergencyContact,
        emergencyPhone,
        allergies,
        medicalConditions,
        skinType,
        preferences,
        notes,
        internalNotes,
        tags,
        marketingConsent,
        smsConsent,
        emailConsent,
        vipStatus,
        status,
      },
    });

    res.status(201).json(client);
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client (PATCH)
router.patch('/:id', authenticate, requireBusiness, validateBody(updateClientSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;
    const { 
      name, email, phone, birthday, address, occupation, referralSource,
      emergencyContact, emergencyPhone, allergies, medicalConditions, 
      skinType, preferences, notes, internalNotes, tags, 
      marketingConsent, smsConsent, emailConsent, vipStatus, status 
    } = req.body;

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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (birthday !== undefined) updateData.birthday = birthday ? new Date(birthday) : null;
    if (address !== undefined) updateData.address = address;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (referralSource !== undefined) updateData.referralSource = referralSource;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (emergencyPhone !== undefined) updateData.emergencyPhone = emergencyPhone;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (medicalConditions !== undefined) updateData.medicalConditions = medicalConditions;
    if (skinType !== undefined) updateData.skinType = skinType;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (notes !== undefined) updateData.notes = notes;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (tags !== undefined) updateData.tags = tags;
    if (marketingConsent !== undefined) updateData.marketingConsent = marketingConsent;
    if (smsConsent !== undefined) updateData.smsConsent = smsConsent;
    if (emailConsent !== undefined) updateData.emailConsent = emailConsent;
    if (vipStatus !== undefined) updateData.vipStatus = vipStatus;
    if (status !== undefined) updateData.status = status;

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    res.json(client);
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Update client (PUT) - alias to PATCH for compatibility
router.put('/:id', authenticate, requireBusiness, validateBody(updateClientSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;
    const { 
      name, email, phone, birthday, address, occupation, referralSource,
      emergencyContact, emergencyPhone, allergies, medicalConditions, 
      skinType, preferences, notes, internalNotes, tags, 
      marketingConsent, smsConsent, emailConsent, vipStatus, status 
    } = req.body;

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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (birthday !== undefined) updateData.birthday = birthday ? new Date(birthday) : null;
    if (address !== undefined) updateData.address = address;
    if (occupation !== undefined) updateData.occupation = occupation;
    if (referralSource !== undefined) updateData.referralSource = referralSource;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (emergencyPhone !== undefined) updateData.emergencyPhone = emergencyPhone;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (medicalConditions !== undefined) updateData.medicalConditions = medicalConditions;
    if (skinType !== undefined) updateData.skinType = skinType;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (notes !== undefined) updateData.notes = notes;
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
    if (tags !== undefined) updateData.tags = tags;
    if (marketingConsent !== undefined) updateData.marketingConsent = marketingConsent;
    if (smsConsent !== undefined) updateData.smsConsent = smsConsent;
    if (emailConsent !== undefined) updateData.emailConsent = emailConsent;
    if (vipStatus !== undefined) updateData.vipStatus = vipStatus;
    if (status !== undefined) updateData.status = status;

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
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
