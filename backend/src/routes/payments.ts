import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireBusiness } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import { createCheckoutSession, createPaymentIntent, getOrCreateCustomer, cancelSubscription, constructWebhookEvent } from '../lib/stripe';
import { config } from '../config';
import prisma from '../lib/prisma';
import { sendBookingConfirmationEmail } from '../lib/email';

const router = Router();

// Get current subscription status
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
        const returnUrl = process.env.BEAUTICIANS_FRONTEND_URL || 'http://localhost:3001';
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

// Create checkout for onboarding (plan selection)
const createCheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
});

router.post('/create-checkout', authenticate, validateBody(createCheckoutSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const businessId = req.user!.businessId;
    const { priceId, planId } = req.body;

    if (!businessId) {
      return res.status(400).json({ error: 'Business not found' });
    }

    // Get user and business
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { business: true },
    });

    if (!user || !user.business) {
      return res.status(404).json({ error: 'User or business not found' });
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.business.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await getOrCreateCustomer({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          businessId: user.business.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update business with customer ID
      await prisma.business.update({
        where: { id: businessId },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      customerEmail: user.email,
      priceId,
      successUrl: `${config.frontendUrls.beauticians}/onboarding/success?plan=${planId}`,
      cancelUrl: `${config.frontendUrls.beauticians}/onboarding/plan?canceled=true`,
      metadata: {
        userId: user.id,
        businessId: user.business.id,
        planId,
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Update business plan (for free starter plan)
const updatePlanSchema = z.object({
  plan: z.string().min(1, 'Plan is required'),
});

router.patch('/plan', authenticate, requireBusiness, validateBody(updatePlanSchema), async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { plan } = req.body;

    await prisma.business.update({
      where: { id: businessId },
      data: { plan: plan.toUpperCase() },
    });

    res.json({ message: 'Plan updated successfully' });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Create subscription checkout
const createSubscriptionSchema = z.object({
  plan: z.enum(['starter', 'pro']),
  billingPeriod: z.enum(['monthly', 'yearly']),
});

router.post('/subscription/create', authenticate, requireBusiness, validateBody(createSubscriptionSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const businessId = req.user!.businessId!;
    const { plan, billingPeriod } = req.body;

    // Get user and business
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { ownedBusiness: true },
    });

    if (!user || !user.ownedBusiness) {
      return res.status(404).json({ error: 'User or business not found' });
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.ownedBusiness.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await getOrCreateCustomer({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          businessId: user.ownedBusiness.id,
        },
      });
      stripeCustomerId = customer.id;

      // Update business with customer ID
      await prisma.business.update({
        where: { id: businessId },
        data: { stripeCustomerId },
      });
    }

    // Get price ID (Starter is FREE - no Stripe checkout needed)
    const priceMap: Record<string, string> = {
      'pro-monthly': config.stripe.prices.proMonthly,
      'pro-yearly': config.stripe.prices.proYearly,
      'business-monthly': config.stripe.prices.businessMonthly,
      'business-yearly': config.stripe.prices.businessYearly,
    };

    const priceId = priceMap[`${plan}-${billingPeriod}`];
    if (!priceId) {
      return res.status(400).json({
        error: 'Invalid plan or billing period',
        message: 'Stripe price configuration missing for selected plan. Please set STRIPE_*_PRICE_ID env variables.',
      });
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      customerEmail: user.email,
      priceId,
      successUrl: `${config.frontendUrls.beauticians}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${config.frontendUrls.beauticians}/dashboard/billing`,
      metadata: {
        userId: user.id,
        businessId: user.ownedBusiness.id,
        plan,
        billingPeriod,
      },
    });

    res.json({ sessionId: session.id, checkoutUrl: session.url });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription checkout' });
  }
});

// Create booking payment intent
const createBookingPaymentSchema = z.object({
  bookingId: z.string().min(1),
});

router.post('/booking/payment', authenticate, requireBusiness, validateBody(createBookingPaymentSchema), async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;
    const { bookingId } = req.body;

    // Get booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        businessId,
      },
      include: {
        client: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Booking already paid' });
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: booking.totalAmount,
      metadata: {
        bookingId: booking.id,
        businessId,
        clientId: booking.clientId,
      },
    });

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentIntentId: paymentIntent.id,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create booking payment error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Cancel subscription
router.post('/subscription/cancel', authenticate, requireBusiness, async (req: AuthRequest, res: Response) => {
  try {
    const businessId = req.user!.businessId!;

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || !business.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    await cancelSubscription(business.stripeSubscriptionId);

    // Update business
    await prisma.business.update({
      where: { id: businessId },
      data: {
        plan: 'FREE',
        subscriptionStatus: 'cancelled',
      },
    });

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Create checkout session for public booking (NO AUTH)
const createPublicBookingCheckoutSchema = z.object({
  bookingId: z.string().min(1),
  businessSlug: z.string().min(1),
});

router.post('/checkout', validateBody(createPublicBookingCheckoutSchema), async (req, res: Response) => {
  try {
    const { bookingId, businessSlug } = req.body;

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        business: true,
        service: true,
        client: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.business.slug !== businessSlug) {
      return res.status(403).json({ error: 'Invalid business' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ error: 'Booking already paid' });
    }

    // Create Stripe checkout session with line items
    const baseUrl = process.env.NEXT_PUBLIC_BOOKING_URL || 'http://localhost:3002';
    const session = await createCheckoutSession({
      customerEmail: booking.client.email,
      mode: 'payment',
      lineItems: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: booking.service.name,
              description: booking.service.description || undefined,
            },
            unit_amount: Math.round(booking.totalAmount * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      successUrl: `${baseUrl}/business/${businessSlug}/success?session_id={CHECKOUT_SESSION_ID}&bookingId=${bookingId}`,
      cancelUrl: `${baseUrl}/business/${businessSlug}/checkout?bookingId=${bookingId}`,
      metadata: {
        bookingId: booking.id,
        businessId: booking.businessId,
        clientId: booking.clientId,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Webhook endpoint (no authentication required)
router.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;

  try {
    const event = constructWebhookEvent(req.body, signature);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const { bookingId, businessId, plan, planId } = session.metadata;

        if (session.mode === 'subscription') {
          // Update business with subscription from onboarding or dashboard
          let planName = plan || planId || 'PRO';
          
          // Convert planId to plan name (e.g., 'pro_monthly' -> 'PRO')
          if (planId) {
            if (planId.includes('business')) {
              planName = 'BUSINESS';
            } else if (planId.includes('pro')) {
              planName = 'PRO';
            }
          }
          
          await prisma.business.update({
            where: { id: businessId },
            data: {
              plan: planName.toUpperCase(),
              subscriptionStatus: 'active',
              stripeSubscriptionId: session.subscription,
              stripeCustomerId: session.customer,
            },
          });
          
          console.log(`✅ Business ${businessId} upgraded to ${planName}`);
        } else if (session.mode === 'payment' && bookingId) {
          // Update booking as paid
          const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
            },
            include: {
              client: true,
              service: true,
              business: true,
            },
          });

          // Send confirmation email
          try {
            await sendBookingConfirmationEmail(booking.client.email, {
              clientName: booking.client.name,
              serviceName: booking.service.name,
              startTime: booking.startTime,
              businessName: booking.business.name,
              location: booking.business.address ? `${booking.business.address}, ${booking.business.city}` : undefined,
            });
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
          }
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        const { bookingId } = paymentIntent.metadata;

        if (bookingId) {
          // Update booking payment status
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              paymentStatus: 'PAID',
              stripeChargeId: paymentIntent.id,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        // Find business by subscription ID
        const business = await prisma.business.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (business) {
          await prisma.business.update({
            where: { id: business.id },
            data: {
              plan: 'FREE',
              subscriptionStatus: 'cancelled',
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        const business = await prisma.business.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (business) {
          await prisma.business.update({
            where: { id: business.id },
            data: {
              subscriptionStatus: subscription.status,
            },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

export default router;
