import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all waiver templates for a business
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const templates = await prisma.waiverTemplate.findMany({
      where: { businessId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching waiver templates:', error);
    res.status(500).json({ error: 'Failed to fetch waiver templates' });
  }
});

// Get waiver template for a specific service
router.get('/service/:serviceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { serviceId } = req.params;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const template = await prisma.waiverTemplate.findUnique({
      where: { 
        serviceId,
        businessId,
      },
    });

    res.json(template);
  } catch (error) {
    console.error('Error fetching waiver template:', error);
    res.status(500).json({ error: 'Failed to fetch waiver template' });
  }
});

// Create or update waiver template for a service
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { serviceId, title, content, requireSignature, requireBefore, autoSend, active } = req.body;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!serviceId || !title || !content) {
      return res.status(400).json({ error: 'Service ID, title, and content are required' });
    }

    // Check if template already exists for this service
    const existing = await prisma.waiverTemplate.findUnique({
      where: { serviceId },
    });

    let template;
    if (existing) {
      template = await prisma.waiverTemplate.update({
        where: { serviceId },
        data: {
          title,
          content,
          requireSignature: requireSignature !== undefined ? requireSignature : true,
          requireBefore: requireBefore !== undefined ? requireBefore : true,
          autoSend: autoSend !== undefined ? autoSend : true,
          active: active !== undefined ? active : true,
        },
      });
    } else {
      template = await prisma.waiverTemplate.create({
        data: {
          businessId,
          serviceId,
          title,
          content,
          requireSignature: requireSignature !== undefined ? requireSignature : true,
          requireBefore: requireBefore !== undefined ? requireBefore : true,
          autoSend: autoSend !== undefined ? autoSend : true,
          active: active !== undefined ? active : true,
        },
      });
    }

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating/updating waiver template:', error);
    res.status(500).json({ error: 'Failed to save waiver template' });
  }
});

// Delete waiver template
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await prisma.waiverTemplate.delete({
      where: { 
        id,
        businessId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting waiver template:', error);
    res.status(500).json({ error: 'Failed to delete waiver template' });
  }
});

// Mark waiver as signed for a booking
router.post('/sign/:bookingId', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { bookingId } = req.params;
    const { signatureUrl } = req.body;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        waiverSigned: true,
        waiverSignedAt: new Date(),
        waiverUrl: signatureUrl,
      },
    });

    res.json({ success: true, message: 'Waiver signed successfully' });
  } catch (error) {
    console.error('Error signing waiver:', error);
    res.status(500).json({ error: 'Failed to sign waiver' });
  }
});

export default router;
