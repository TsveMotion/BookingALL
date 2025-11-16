import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all notifications for the authenticated user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const businessId = req.user?.businessId;

    if (!userId || !businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        businessId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50 notifications
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const businessId = req.user?.businessId;

    if (!userId || !businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        businessId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Mark single notification as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!userId || !businessId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const notification = await prisma.notification.update({
      where: {
        id,
        userId,
        businessId,
      },
      data: {
        read: true,
      },
    });

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Helper function to create notification (used by other routes)
export async function createNotification(
  userId: string,
  businessId: string,
  type: string,
  message: string,
  meta?: any
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        businessId,
        type,
        message,
        meta: meta || {},
      },
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export default router;
