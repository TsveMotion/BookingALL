import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import prisma from '../lib/prisma';

const router = Router();

// Permission check middleware - only Pro/Business plans
const requirePaidPlan = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const businessId = req.user!.businessId!;
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { plan: true },
    });

    if (!business || !['STARTER', 'PRO', 'BUSINESS'].includes(business.plan)) {
      return res.status(403).json({ 
        error: 'This feature requires Starter plan or higher',
        currentPlan: business?.plan || 'FREE',
        requiredPlan: 'STARTER, PRO or BUSINESS'
      });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(500).json({ error: 'Permission check failed' });
  }
};

// Get all campaigns for business
router.get('/', authenticate, requireBusiness, requirePaidPlan, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    const campaigns = await prisma.campaign.findMany({
      where: { businessId },
      include: {
        _count: {
          select: { recipients: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get single campaign
router.get('/:id', authenticate, requireBusiness, requirePaidPlan, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { 
        id,
        businessId,
      },
      include: {
        recipients: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Create campaign
const createCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['email', 'sms', 'followup', 'promotion', 'reactivation']),
  subject: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
  targetAudience: z.enum(['all', 'new', 'returning', 'inactive', 'highvalue']),
  scheduledAt: z.string().optional(),
  clientIds: z.array(z.string()).optional(),
});

router.post('/', authenticate, requireBusiness, requirePaidPlan, validateBody(createCampaignSchema), async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const userId = req.user!.userId;
    const { name, type, subject, message, targetAudience, scheduledAt, clientIds } = req.body;

    // Determine recipients based on target audience or explicit client IDs
    let clientsToTarget;
    
    if (clientIds && clientIds.length > 0) {
      // Use explicitly provided client IDs
      clientsToTarget = await prisma.client.findMany({
        where: {
          businessId,
          id: { in: clientIds },
          status: 'active',
        },
        select: { id: true },
      });
    } else {
      // Auto-select based on audience
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      switch (targetAudience) {
        case 'new':
          clientsToTarget = await prisma.client.findMany({
            where: {
              businessId,
              status: 'active',
              bookings: { none: {} },
            },
            select: { id: true },
          });
          break;
        
        case 'returning':
          clientsToTarget = await prisma.client.findMany({
            where: {
              businessId,
              status: 'active',
              bookings: {
                some: {},
              },
            },
            select: { id: true },
          });
          break;
        
        case 'inactive':
          clientsToTarget = await prisma.client.findMany({
            where: {
              businessId,
              status: 'active',
              updatedAt: { lt: thirtyDaysAgo },
            },
            select: { id: true },
          });
          break;
        
        case 'highvalue':
          // Clients with 3+ bookings
          const clients = await prisma.client.findMany({
            where: {
              businessId,
              status: 'active',
            },
            include: {
              _count: {
                select: { bookings: true },
              },
            },
          });
          clientsToTarget = clients
            .filter(c => c._count.bookings >= 3)
            .map(c => ({ id: c.id }));
          break;
        
        default:
          clientsToTarget = await prisma.client.findMany({
            where: {
              businessId,
              status: 'active',
            },
            select: { id: true },
          });
      }
    }

    // Create campaign with recipients
    const campaign = await prisma.campaign.create({
      data: {
        businessId,
        name,
        type,
        subject,
        message,
        targetAudience,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'draft',
        recipientCount: clientsToTarget.length,
        createdBy: userId,
        recipients: {
          create: clientsToTarget.map(client => ({
            clientId: client.id,
            status: 'pending',
          })),
        },
      },
      include: {
        _count: {
          select: { recipients: true },
        },
      },
    });

    res.json(campaign);
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// Send campaign
router.post('/:id/send', authenticate, requireBusiness, requirePaidPlan, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { 
        id,
        businessId,
      },
      include: {
        recipients: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status === 'sent') {
      return res.status(400).json({ error: 'Campaign already sent' });
    }

    // TODO: Integrate with email/SMS service (SendGrid, Twilio, etc.)
    // For now, just mark as sent

    await prisma.campaign.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        sentCount: campaign.recipientCount,
      },
    });

    // Update recipients
    await prisma.campaignRecipient.updateMany({
      where: { campaignId: id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });

    res.json({ message: 'Campaign sent successfully', sentCount: campaign.recipientCount });
  } catch (error) {
    console.error('Send campaign error:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

// Delete campaign
router.delete('/:id', authenticate, requireBusiness, requirePaidPlan, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, businessId },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    await prisma.campaign.delete({
      where: { id },
    });

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// Get campaign analytics
router.get('/:id/analytics', authenticate, requireBusiness, requirePaidPlan, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: { id, businessId },
      include: {
        recipients: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const analytics = {
      total: campaign.recipientCount,
      sent: campaign.sentCount,
      delivered: campaign.deliveredCount,
      opened: campaign.openedCount,
      clicked: campaign.clickedCount,
      deliveryRate: campaign.recipientCount > 0 ? (campaign.deliveredCount / campaign.recipientCount) * 100 : 0,
      openRate: campaign.deliveredCount > 0 ? (campaign.openedCount / campaign.deliveredCount) * 100 : 0,
      clickRate: campaign.openedCount > 0 ? (campaign.clickedCount / campaign.openedCount) * 100 : 0,
    };

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
