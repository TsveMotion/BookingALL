import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all add-ons for a business
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const addons = await prisma.serviceAddon.findMany({
      where: { businessId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookingAddons: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(addons);
  } catch (error) {
    console.error('Error fetching add-ons:', error);
    res.status(500).json({ error: 'Failed to fetch add-ons' });
  }
});

// Get add-ons for a specific service
router.get('/service/:serviceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { serviceId } = req.params;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const addons = await prisma.serviceAddon.findMany({
      where: { 
        businessId,
        serviceId,
      },
      orderBy: { name: 'asc' },
    });

    res.json(addons);
  } catch (error) {
    console.error('Error fetching service add-ons:', error);
    res.status(500).json({ error: 'Failed to fetch service add-ons' });
  }
});

// Create new add-on
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { serviceId, name, description, priceAdjustment, durationAdjustment, required } = req.body;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!serviceId || !name) {
      return res.status(400).json({ error: 'Service ID and name are required' });
    }

    const addon = await prisma.serviceAddon.create({
      data: {
        businessId,
        serviceId,
        name,
        description,
        priceAdjustment: parseFloat(priceAdjustment) || 0,
        durationAdjustment: parseInt(durationAdjustment) || 0,
        required: required || false,
      },
    });

    res.status(201).json(addon);
  } catch (error) {
    console.error('Error creating add-on:', error);
    res.status(500).json({ error: 'Failed to create add-on' });
  }
});

// Update add-on
router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;
    const { name, description, priceAdjustment, durationAdjustment, required, active } = req.body;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const addon = await prisma.serviceAddon.update({
      where: { 
        id,
        businessId,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(priceAdjustment !== undefined && { priceAdjustment: parseFloat(priceAdjustment) }),
        ...(durationAdjustment !== undefined && { durationAdjustment: parseInt(durationAdjustment) }),
        ...(required !== undefined && { required }),
        ...(active !== undefined && { active }),
      },
    });

    res.json(addon);
  } catch (error) {
    console.error('Error updating add-on:', error);
    res.status(500).json({ error: 'Failed to update add-on' });
  }
});

// Delete add-on
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await prisma.serviceAddon.delete({
      where: { 
        id,
        businessId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting add-on:', error);
    res.status(500).json({ error: 'Failed to delete add-on' });
  }
});

export default router;
