import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import { createSession } from '../../lib/auth';

const router = Router();
const prisma = new PrismaClient();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
      scope: ['profile', 'email'],
    },
    async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found from Google'));
        }

        // Just return the profile, we'll handle user creation in the callback
        return done(null, profile);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { business: true },
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Google OAuth routes - Unified for all dashboards
router.get('/google', (req, res, next) => {
  // Capture the 'returnTo' query parameter to know which dashboard initiated the flow
  const returnTo = req.query.returnTo as string || 'beauticians';
  
  // Store in session for callback
  if (req.session) {
    (req.session as any).returnTo = returnTo;
  }
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false,
    state: returnTo // Pass as state parameter
  })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login?error=google_auth_failed',
    session: false 
  }),
  async (req: Request, res: Response) => {
    try {
      const profile = req.user as any;

      if (!profile) {
        return res.redirect(`${process.env.MAIN_URL}/login?error=authentication_failed`);
      }

      const email = profile.emails?.[0]?.value;
      if (!email) {
        return res.redirect(`${process.env.MAIN_URL}/login?error=no_email`);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { business: true },
      });

      if (existingUser && existingUser.business) {
        // User exists and has completed signup - log them in
        // Route to correct dashboard based on business category
        const tokens = await createSession(existingUser.id);
        
        let redirectUrl: string;
        switch (existingUser.business.category) {
          case 'BEAUTICIAN':
            redirectUrl = process.env.BEAUTICIANS_URL!;
            break;
          case 'HAIRDRESSER':
            redirectUrl = process.env.HAIRDRESSERS_URL!;
            break;
          case 'BARBER':
            redirectUrl = process.env.BARBERS_URL!;
            break;
          default:
            redirectUrl = process.env.MAIN_URL!;
        }
        
        return res.redirect(
          `${redirectUrl}/auth/callback?token=${tokens.token}&refreshToken=${tokens.refreshToken}`
        );
      }

      // New user or incomplete signup - redirect to signup with pre-filled data
      // Get the returnTo parameter to know which dashboard to redirect to
      const returnTo = (req.query.state as string) || (req.session as any)?.returnTo || 'beauticians';
      
      let signupUrl: string;
      switch (returnTo.toLowerCase()) {
        case 'beauticians':
        case 'beautician':
          signupUrl = process.env.BEAUTICIANS_URL!;
          break;
        case 'hairdressers':
        case 'hairdresser':
          signupUrl = process.env.HAIRDRESSERS_URL!;
          break;
        case 'barbers':
        case 'barber':
          signupUrl = process.env.BARBERS_URL!;
          break;
        default:
          signupUrl = process.env.MAIN_URL!;
      }

      const name = profile.displayName || '';
      const googleId = profile.id;

      // Encode data for URL
      const signupData = encodeURIComponent(JSON.stringify({
        email,
        name,
        googleId,
        emailVerified: true,
      }));

      res.redirect(
        `${signupUrl}/register?googleData=${signupData}`
      );
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.MAIN_URL}/login?error=server_error`);
    }
  }
);

export default router;
