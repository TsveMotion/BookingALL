import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import authRoutes from './routes/auth';
import authGoogleRoutes from './routes/auth-google';
import userRoutes from './routes/user';
import businessRoutes from './routes/business';
import servicesRoutes from './routes/services';
import clientsRoutes from './routes/clients';
import bookingsRoutes from './routes/bookings';
import paymentsRoutes from './routes/payments';
import analyticsRoutes from './routes/analytics';
import bookingPageRoutes from './routes/booking-page';
import apiDocsRoutes from './routes/api-docs';
import abandonedBookingsRoutes from './routes/abandoned-bookings';
import locationsRoutes from './routes/locations';
import staffRoutes from './routes/staff';
import settingsRoutes from './routes/settings';
import notificationsRoutes from './routes/notifications';
import addonsRoutes from './routes/addons';
import aftercareRoutes from './routes/aftercare';
import waiversRoutes from './routes/waivers';
import campaignsRoutes from './routes/campaigns';
import wordpressRoutes from './routes/wordpress';
import uploadRoutes from './routes/upload';
import billingRoutes from './routes/billing';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS must be before other middleware
app.use(cors(config.cors));

// Handle preflight requests
app.options('*', cors(config.cors));

app.use(cookieParser());

// Session middleware (required for passport)
app.use(session({
  secret: config.jwt.secret,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'production' ? 100 : 1000, // More requests allowed in dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', authGoogleRoutes); // Google OAuth with proper redirects
app.use('/api/user', userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/booking-page', bookingPageRoutes);
app.use('/api/docs', apiDocsRoutes);
app.use('/api/abandoned-bookings', abandonedBookingsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/addons', addonsRoutes);
app.use('/api/aftercare', aftercareRoutes);
app.use('/api/waivers', waiversRoutes);
app.use('/api/wordpress', wordpressRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/billing', billingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 GlamBooking Backend API                  ║
║                                               ║
║   Environment: ${config.nodeEnv.padEnd(30)}║
║   Port: ${PORT.toString().padEnd(38)}║
║   CORS: Enabled                               ║
║                                               ║
║   Health: http://localhost:${PORT}/health${' '.repeat(10)}║
║   API: http://localhost:${PORT}/api${' '.repeat(14)}║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

export default app;
