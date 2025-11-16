import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import { createCheckoutSession, getOrCreateCustomer } from '../lib/stripe';
import { config } from '../config';
import prisma from '../lib/prisma';

const router = Router();

// Create checkout session for billing page (upgrade/change plan)
const createCheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  planId: z.string().optional(),
});

router.post('/create-checkout-session', authenticate, requireBusiness, validateBody(createCheckoutSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const businessId = req.user!.businessId!;
    const { priceId, planId } = req.body;

    // Get user and business
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedBusiness: true,
        business: true,
      },
    });

    const business = user?.ownedBusiness || user?.business;

    if (!user || !business) {
      return res.status(404).json({ error: 'User or business not found' });
    }

    // Get or create Stripe customer
    let stripeCustomerId = business.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await getOrCreateCustomer({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          businessId: business.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update business with customer ID
      await prisma.business.update({
        where: { id: business.id },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      customerEmail: user.email,
      priceId,
      successUrl: `${config.frontendUrls.beauticians}/dashboard/billing?success=true`,
      cancelUrl: `${config.frontendUrls.beauticians}/dashboard/billing?canceled=true`,
      metadata: {
        userId: user.id,
        businessId: business.id,
        planId: planId || 'unknown',
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('Create billing checkout error:', error);
    res.status(500).json({ error: error.message || 'Failed to create checkout session' });
  }
});

// Get subscription status
router.get('/subscription', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        plan: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Create customer portal session for subscription management
    let customerPortalUrl = null;
    if (business.stripeCustomerId) {
      try {
        const { stripe } = await import('../lib/stripe');
        const returnUrl = config.frontendUrls.beauticians;
        const session = await stripe.billingPortal.sessions.create({
          customer: business.stripeCustomerId,
          return_url: `${returnUrl}/dashboard/billing`,
        });
        customerPortalUrl = session.url;
      } catch (err) {
        console.error('Failed to create portal session:', err);
      }
    }

    res.json({
      active: business.subscriptionStatus === 'active',
      plan: business.plan?.toLowerCase() || null,
      subscriptionStatus: business.subscriptionStatus,
      customerPortalUrl,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export default router;
