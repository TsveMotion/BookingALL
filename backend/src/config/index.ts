import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || '',
    shadowUrl: process.env.SHADOW_DATABASE_URL || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'fallback-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    prices: {
      // Starter is FREE - no Stripe prices needed
      proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
      proYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
      businessMonthly: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || '',
      businessYearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || '',
      sms500: process.env.STRIPE_SMS_500_PRICE_ID || '',
      sms1000: process.env.STRIPE_SMS_1000_PRICE_ID || '',
    },
  },
  
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://localhost:3004',
        'http://localhost:3005',
        'http://localhost:4000',
        process.env.MAIN_FRONTEND_URL,
        process.env.BEAUTICIANS_FRONTEND_URL,
        process.env.HAIRDRESSERS_FRONTEND_URL,
        process.env.BARBERS_FRONTEND_URL,
      ].filter(Boolean);
      
      const productionDomains = [
        'https://glambooking.co.uk',
        'https://www.glambooking.co.uk',
        'https://beauticians.glambooking.co.uk',
        'https://hairdressers.glambooking.co.uk',
        'https://barbers.glambooking.co.uk',
        'https://booking.glambooking.co.uk',
        'https://api.glambooking.co.uk',
      ];
      
      allowedOrigins.push(...productionDomains);
      
      // Allow all origins in development
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  },
  
  email: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'GlamBooking <noreply@glambooking.co.uk>',
  },
  
  redis: {
    url: process.env.KV_REST_API_URL || process.env.REDIS_URL || '',
    token: process.env.KV_REST_API_TOKEN || '',
  },
  
  blob: {
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
  },
  
  frontendUrls: {
    main: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    beauticians: process.env.BEAUTICIANS_FRONTEND_URL || 'http://localhost:3001',
    hairdressers: process.env.HAIRDRESSERS_FRONTEND_URL || 'http://localhost:3002',
    barbers: process.env.BARBERS_FRONTEND_URL || 'http://localhost:3003',
  },
};
