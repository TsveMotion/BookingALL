import { Router, Response, Request } from 'express';
import prisma from '../lib/prisma';
import { createSession, getDashboardUrl } from '../lib/auth';
import { getGoogleAuthUrl, getGoogleUser } from '../lib/google-oauth';
import { config } from '../config';

const router = Router();

/**
 * GET /auth/google
 * Initiates Google OAuth flow
 * Query params:
 *   - returnTo: 'beauticians' | 'hairdressers' | 'barbers' (optional)
 */
router.get('/google', async (req: Request, res: Response) => {
  try {
    const returnTo = req.query.returnTo as string || 'beauticians';
    
    // Map returnTo to frontend URLs
    const frontendUrls: Record<string, string> = {
      beauticians: config.frontendUrls.beauticians,
      hairdressers: config.frontendUrls.hairdressers || 'http://localhost:3002',
      barbers: config.frontendUrls.barbers || 'http://localhost:3003',
    };
    
    const baseUrl = frontendUrls[returnTo] || config.frontendUrls.beauticians;
    const callbackUrl = `${config.backendUrl}/auth/google/callback`;
    
    // Store returnTo in state parameter
    const state = Buffer.from(JSON.stringify({ returnTo, baseUrl })).toString('base64');
    
    const authUrl = await getGoogleAuthUrl(callbackUrl);
    const authUrlWithState = `${authUrl}&state=${state}`;
    
    console.log('✅ Google OAuth initiated:', { returnTo, baseUrl, callbackUrl });
    
    // Redirect to Google OAuth
    res.redirect(authUrlWithState);
  } catch (error: any) {
    console.error('❌ Google OAuth initiation error:', error);
    res.status(500).json({ 
      error: 'Failed to initiate Google authentication',
      details: error.message 
    });
  }
});

/**
 * GET /auth/google/callback
 * Handles Google OAuth callback
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Authorization code is required');
    }

    // Decode state parameter
    let returnTo = 'beauticians';
    let baseUrl = config.frontendUrls.beauticians;
    
    if (state && typeof state === 'string') {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
        returnTo = decoded.returnTo || 'beauticians';
        baseUrl = decoded.baseUrl || config.frontendUrls.beauticians;
      } catch (e) {
        console.warn('Failed to decode state parameter:', e);
      }
    }

    const callbackUrl = `${config.backendUrl}/auth/google/callback`;

    // Get Google user data
    const googleUser = await getGoogleUser(code, callbackUrl);
    console.log('✅ Google user authenticated:', googleUser.email);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            plan: true,
          },
        },
        ownedBusiness: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            plan: true,
          },
        },
      },
    });

    if (!user) {
      console.log('📝 Creating new user from Google OAuth');
      
      // Create new user with business
      const businessName = `${googleUser.name}'s Business`;
      const baseSlug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      let slug = baseSlug;
      let slugExists = await prisma.business.findUnique({ where: { slug } });
      let counter = 1;
      
      while (slugExists) {
        slug = `${baseSlug}-${counter}`;
        slugExists = await prisma.business.findUnique({ where: { slug } });
        counter++;
      }

      // Determine category based on returnTo
      const categoryMap: Record<string, string> = {
        beauticians: 'BEAUTICIAN',
        hairdressers: 'HAIRDRESSER',
        barbers: 'BARBER',
      };
      const category = categoryMap[returnTo] || 'BEAUTICIAN';

      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: googleUser.email.toLowerCase(),
            passwordHash: '', // No password for OAuth users
            name: googleUser.name,
            avatar: googleUser.picture,
            emailVerified: googleUser.verified_email,
            role: 'OWNER',
          },
        });

        const business = await tx.business.create({
          data: {
            name: businessName,
            slug,
            category: category as any,
            ownerId: newUser.id,
            plan: 'FREE',
          },
        });

        // Create default location
        const location = await tx.location.create({
          data: {
            businessId: business.id,
            name: `${businessName} - Main Location`,
            isPrimary: true,
            active: true,
          },
        });

        // Create staff record for owner
        await tx.staff.create({
          data: {
            businessId: business.id,
            userId: newUser.id,
            name: googleUser.name,
            email: googleUser.email.toLowerCase(),
            phone: '',
            role: 'OWNER',
            active: true,
            inviteAccepted: true,
            assignedLocationIds: [location.id],
            permissions: {
              canManageBookings: true,
              canManageClients: true,
              canManageServices: true,
              canManageStaff: true,
              canViewReports: true,
            },
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: newUser.id },
          data: { businessId: business.id },
          include: { 
            business: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                plan: true,
              },
            },
            ownedBusiness: {
              select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                plan: true,
              },
            },
          },
        });

        return updatedUser;
      });

      console.log('✅ New user created:', user.email);
    } else {
      console.log('✅ Existing user found:', user.email);
    }

    // Create session
    const session = await createSession(user.id, req.headers['user-agent'], req.ip);
    
    const business = user.ownedBusiness || user.business;
    const dashboardUrl = `${baseUrl}/dashboard`;

    console.log('✅ Session created, redirecting to:', dashboardUrl);

    // Redirect to frontend with token
    const redirectUrl = `${baseUrl}/auth/google/success?token=${session.token}&refreshToken=${session.refreshToken}`;
    res.redirect(redirectUrl);
    
  } catch (error: any) {
    console.error('❌ Google callback error:', error);
    console.error('Full error:', {
      message: error.message,
      stack: error.stack,
    });
    
    // Redirect to error page
    const errorUrl = `${config.frontendUrls.beauticians}/auth/error?message=${encodeURIComponent('Google authentication failed')}`;
    res.redirect(errorUrl);
  }
});

export default router;
