import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import { cache } from '../lib/redis';

const router = Router();

// Validation schemas
const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().optional(),
  locationIds: z.array(z.string()).optional(),
});

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  duration: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  category: z.string().optional(),
  active: z.boolean().optional(),
  locationIds: z.array(z.string()).optional(),
});

// Get all services for business
router.get('/', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { active, category } = req.query;

    // Build where clause
    const where: any = { businessId };
    if (active !== undefined) {
      where.active = active === 'true';
    }
    if (category) {
      where.category = category as string;
    }

    // Try cache first
    const cacheKey = `services:${businessId}:${JSON.stringify(where)}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        locations: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Cache for 5 minutes
    await cache.set(cacheKey, services, 300);

    res.json(services);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get single service
router.get('/:id', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;

    const service = await prisma.service.findFirst({
      where: {
        id,
        businessId,
      },
      include: {
        locations: {
          include: {
            location: true,
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create service
router.post('/', authenticate, requireBusiness, validateBody(createServiceSchema), async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const userId = req.user!.userId;
    const { name, description, duration, price, category, locationIds } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration,
        price,
        category,
        businessId,
        createdById: userId,
        locations: locationIds ? {
          create: locationIds.map((locationId: string) => ({
            locationId,
          })),
        } : undefined,
      },
      include: {
        locations: {
          include: {
            location: true,
          },
        },
      },
    });

    // Invalidate cache
    await cache.del(`services:${businessId}:*`);

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service
router.patch('/:id', authenticate, requireBusiness, validateBody(updateServiceSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;
    const { name, description, duration, price, category, active, locationIds } = req.body;

    // Check if service exists and belongs to business
    const existingService = await prisma.service.findFirst({
      where: { id, businessId },
    });

    if (!existingService) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Update service with location associations
    const service = await prisma.$transaction(async (tx) => {
      // If locationIds provided, update associations
      if (locationIds) {
        // Delete existing associations
        await tx.serviceLocation.deleteMany({
          where: { serviceId: id },
        });
        
        // Create new associations
        if (locationIds.length > 0) {
          await tx.serviceLocation.createMany({
            data: locationIds.map((locationId: string) => ({
              serviceId: id,
              locationId,
            })),
          });
        }
      }

      // Update service
      return tx.service.update({
        where: { id },
        data: {
          name,
          description,
          duration,
          price,
          category,
          active,
        },
        include: {
          locations: {
            include: {
              location: true,
            },
          },
        },
      });
    });

    // Invalidate cache
    await cache.del(`services:${businessId}:*`);

    res.json(service);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service
router.delete('/:id', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user!.businessId!;

    // Check if service exists and belongs to business
    const service = await prisma.service.findFirst({
      where: { id, businessId },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Check if service has bookings
    const bookingCount = await prisma.booking.count({
      where: { serviceId: id },
    });

    if (bookingCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete service with existing bookings. Please deactivate it instead.' 
      });
    }

    await prisma.service.delete({
      where: { id },
    });

    // Invalidate cache
    await cache.del(`services:${businessId}:*`);

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
