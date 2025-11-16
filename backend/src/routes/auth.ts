import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, verifyPassword, createSession, refreshSession, getDashboardUrl, generateVerificationToken, generatePasswordResetToken } from '../lib/auth';
import { validateBody } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../validators/auth';
import { getGoogleAuthUrl, getGoogleUser } from '../lib/google-oauth';
import { config } from '../config';
import { sendVerificationEmail } from '../lib/email';

const router = Router();

// Register
router.post('/register', validateBody(registerSchema), async (req, res: Response) => {
  try {
    const { email, password, name, businessName, category, phone, address, city, postcode, locationName } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate unique business slug
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

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and business in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user first
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
          phone,
          role: 'OWNER',
        },
      });

      // Create business owned by this user
      const business = await tx.business.create({
        data: {
          name: businessName,
          slug,
          category: category.toUpperCase() as any, // Convert to uppercase for enum
          ownerId: newUser.id,
          plan: 'FREE',
        },
      });

      // Update user with business ID
      const updatedUser = await tx.user.update({
        where: { id: newUser.id },
        data: { businessId: business.id },
      });

      // Save business address to business record
      if (address || city || postcode) {
        await tx.business.update({
          where: { id: business.id },
          data: {
            address: address || null,
            city: city || null,
            postcode: postcode || null,
          },
        });
      }

      // Auto-create default location for FREE plan
      const location = await tx.location.create({
        data: {
          businessId: business.id,
          name: locationName || `${businessName} - Main Location`,
          address: address || null,
          city: city || null,
          postcode: postcode || null,
          isPrimary: true,
          active: true,
        },
      });

      // Auto-create staff record for owner
      await tx.staff.create({
        data: {
          businessId: business.id,
          userId: newUser.id,
          name: name,
          email: email.toLowerCase(),
          phone: phone || '',
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

      return updatedUser;
    });

    // Generate verification token
    const verificationToken = await generateVerificationToken(user.id);

    // Send welcome/verification email
    try {
      const verificationUrl = `${config.frontendUrls.beauticians}/auth/verify?token=${verificationToken}`;
      await sendVerificationEmail(email, verificationUrl, name);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Create session
    const session = await createSession(
      user.id,
      req.headers['user-agent'],
      req.ip
    );

    // Get dashboard URL
    const isDevelopment = process.env.NODE_ENV === 'development';
    const dashboardUrls: Record<string, string> = isDevelopment
      ? {
          BEAUTICIAN: process.env.FRONTEND_BEAUTICIANS_URL || 'http://localhost:3001/dashboard',
          HAIRDRESSER: 'http://localhost:3002/dashboard',
          BARBER: 'http://localhost:3003/dashboard',
          NAIL_TECH: process.env.FRONTEND_BEAUTICIANS_URL || 'http://localhost:3001/dashboard',
          MASSAGE: process.env.FRONTEND_BEAUTICIANS_URL || 'http://localhost:3001/dashboard',
          SPA: process.env.FRONTEND_BEAUTICIANS_URL || 'http://localhost:3001/dashboard',
          OTHER: process.env.FRONTEND_MAIN_URL || 'http://localhost:3000/dashboard',
        }
      : {
          BEAUTICIAN: 'https://beauticians.glambooking.co.uk/dashboard',
          HAIRDRESSER: 'https://hairdressers.glambooking.co.uk/dashboard',
          BARBER: 'https://barbers.glambooking.co.uk/dashboard',
          NAIL_TECH: 'https://beauticians.glambooking.co.uk/dashboard',
          MASSAGE: 'https://beauticians.glambooking.co.uk/dashboard',
          SPA: 'https://beauticians.glambooking.co.uk/dashboard',
          OTHER: 'https://glambooking.co.uk/dashboard',
        };
    const dashboardUrl = dashboardUrls[category];

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      session: {
        token: session.token,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      },
      dashboardUrl: dashboardUrl,
      category,
    });
  } catch (error: any) {
    console.error('❌ Register error:', error);
    
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return res.status(400).json({ 
        error: `This ${field} is already in use`,
        details: 'Please use a different value'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.message 
      });
    }
    
    // Log detailed error for debugging
    console.error('Full error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
    });
  }
});

// Login
router.post('/login', validateBody(loginSchema), async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        business: {
          select: {
            id: true,
            category: true,
            slug: true,
            name: true,
          },
        },
        ownedBusiness: {
          select: {
            id: true,
            category: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create session
    const session = await createSession(
      user.id,
      req.headers['user-agent'],
      req.ip
    );

    // Determine business and category
    const business = user.ownedBusiness || user.business;
    const category = business?.category || null;
    const dashboardUrl = getDashboardUrl(category);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        businessId: business?.id || null,
        businessName: business?.name || null,
        businessSlug: business?.slug || null,
      },
      session: {
        token: session.token,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
      },
      dashboardUrl: dashboardUrl,
      category,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token
router.post('/refresh', validateBody(refreshTokenSchema), async (req, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const newSession = await refreshSession(refreshToken);

    if (!newSession) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    res.json({
      session: {
        token: newSession.token,
        refreshToken: newSession.refreshToken,
        expiresAt: newSession.expiresAt,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;

    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            plan: true,
            logo: true,
          },
        },
        ownedBusiness: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            plan: true,
            logo: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const business = user.ownedBusiness || user.business;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      business: business || null,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Verify email
router.post('/verify-email', validateBody(verifyEmailSchema), async (req, res: Response) => {
  try {
    const { token } = req.body;

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: true },
      }),
      prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// Forgot password
router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = await generatePasswordResetToken(user.id);

    // Send password reset email
    try {
      const resetUrl = `${config.frontendUrls.beauticians}/reset-password?token=${resetToken}`;
      const { sendPasswordResetEmail } = await import('../lib/email');
      await sendPasswordResetEmail(email, resetUrl, user.name || 'User');
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Still return success to not reveal if email exists
    }

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// Reset password
router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res: Response) => {
  try {
    const { token, password } = req.body;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Invalidate all existing sessions
      prisma.session.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Google OAuth - Get authorization URL
router.get('/google/url', async (req, res: Response) => {
  try {
    const redirectUri = req.query.redirectUri as string || `${config.frontendUrls.beauticians}/auth/google/callback`;
    const authUrl = await getGoogleAuthUrl(redirectUri);
    res.json({ url: authUrl });
  } catch (error) {
    console.error('Google auth URL error:', error);
    res.status(500).json({ error: 'Failed to generate Google auth URL' });
  }
});

// Google OAuth - Callback
router.get('/google/callback', async (req, res: Response) => {
  try {
    const { code, redirectUri } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const finalRedirectUri = redirectUri as string || `${config.frontendUrls.beauticians}/auth/google/callback`;

    // Get Google user data
    const googleUser = await getGoogleUser(code, finalRedirectUri);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
      include: {
        business: true,
      },
    });

    if (!user) {
      // Create new user - for Google OAuth, we need to create business too
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
            category: 'BEAUTICIAN',
            ownerId: newUser.id,
            plan: 'FREE',
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: newUser.id },
          data: { businessId: business.id },
          include: { business: true },
        });

        return updatedUser;
      });
    }

    // Create session
    const session = await createSession(user.id, req.headers['user-agent'], req.ip);
    const business = user.ownedBusiness || user.business;
    const dashboardUrl = getDashboardUrl(business?.category || null);

    res.json({
      token: session.token,
      refreshToken: session.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        businessId: user.businessId,
      },
      business: user.business,
      dashboardUrl,
    });
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

export default router;
