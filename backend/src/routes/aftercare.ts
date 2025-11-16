import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all aftercare templates for a business
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const templates = await prisma.aftercareTemplate.findMany({
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
    console.error('Error fetching aftercare templates:', error);
    res.status(500).json({ error: 'Failed to fetch aftercare templates' });
  }
});

// Get aftercare template for a specific service
router.get('/service/:serviceId', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { serviceId } = req.params;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const template = await prisma.aftercareTemplate.findUnique({
      where: { 
        serviceId,
        businessId,
      },
    });

    res.json(template);
  } catch (error) {
    console.error('Error fetching aftercare template:', error);
    res.status(500).json({ error: 'Failed to fetch aftercare template' });
  }
});

// Create or update aftercare template for a service
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { serviceId, title, content, sendMethod, sendTrigger, sendDelayHours, active } = req.body;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!serviceId || !title || !content) {
      return res.status(400).json({ error: 'Service ID, title, and content are required' });
    }

    // Check if template already exists for this service
    const existing = await prisma.aftercareTemplate.findUnique({
      where: { serviceId },
    });

    let template;
    if (existing) {
      template = await prisma.aftercareTemplate.update({
        where: { serviceId },
        data: {
          title,
          content,
          sendMethod: sendMethod || 'email',
          sendTrigger: sendTrigger || 'immediate',
          sendDelayHours: parseInt(sendDelayHours) || 0,
          active: active !== undefined ? active : true,
        },
      });
    } else {
      template = await prisma.aftercareTemplate.create({
        data: {
          businessId,
          serviceId,
          title,
          content,
          sendMethod: sendMethod || 'email',
          sendTrigger: sendTrigger || 'immediate',
          sendDelayHours: parseInt(sendDelayHours) || 0,
          active: active !== undefined ? active : true,
        },
      });
    }

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating/updating aftercare template:', error);
    res.status(500).json({ error: 'Failed to save aftercare template' });
  }
});

// Delete aftercare template
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await prisma.aftercareTemplate.delete({
      where: { 
        id,
        businessId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting aftercare template:', error);
    res.status(500).json({ error: 'Failed to delete aftercare template' });
  }
});

// Send aftercare to a booking
router.post('/send/:bookingId', authenticate, async (req: AuthRequest, res) => {
  try {
    const businessId = req.user?.businessId;
    const { bookingId } = req.params;
    
    if (!businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get booking with service and aftercare template
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: {
            aftercareTemplate: true,
          },
        },
        client: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (!booking.service.aftercareTemplate) {
      return res.status(404).json({ error: 'No aftercare template for this service' });
    }

    // TODO: Implement actual email/SMS sending logic here
    // For now, just mark as sent
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        aftercareSent: true,
        aftercareSentAt: new Date(),
      },
    });

    res.json({ success: true, message: 'Aftercare sent successfully' });
  } catch (error) {
    console.error('Error sending aftercare:', error);
    res.status(500).json({ error: 'Failed to send aftercare' });
  }
});

export default router;
