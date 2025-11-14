import { Router } from 'express';

const router = Router();

export const apiRoutes = [
  {
    category: 'Authentication',
    routes: [
      {
        method: 'POST',
        path: '/auth/register',
        description: 'Register a new user and create a business',
        authentication: false,
        requestBody: {
          email: 'string (required)',
          password: 'string (required)',
          name: 'string (required)',
          businessName: 'string (required)',
          category: 'string (required) - BEAUTICIAN, HAIRDRESSER, BARBER, etc.',
          phone: 'string (optional)',
        },
        response: {
          user: 'User object',
          session: { token: 'string', refreshToken: 'string', expiresAt: 'string' },
          dashboardUrl: 'string',
          category: 'string',
        },
        example: `curl -X POST http://localhost:4000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "businessName": "Beautiful Studio",
    "category": "BEAUTICIAN"
  }'`,
      },
      {
        method: 'POST',
        path: '/auth/login',
        description: 'Login with email and password',
        authentication: false,
        requestBody: {
          email: 'string (required)',
          password: 'string (required)',
        },
        response: {
          user: 'User object',
          session: { token: 'string', refreshToken: 'string', expiresAt: 'string' },
          dashboardUrl: 'string',
          category: 'string',
        },
      },
      {
        method: 'POST',
        path: '/auth/refresh',
        description: 'Refresh JWT token',
        authentication: false,
        requestBody: {
          refreshToken: 'string (required)',
        },
        response: {
          session: { token: 'string', refreshToken: 'string', expiresAt: 'string' },
        },
      },
      {
        method: 'POST',
        path: '/auth/logout',
        description: 'Logout current user',
        authentication: true,
        requestBody: {},
        response: { message: 'string' },
      },
      {
        method: 'GET',
        path: '/auth/me',
        description: 'Get current authenticated user',
        authentication: true,
        response: 'User object with business details',
      },
    ],
  },
  {
    category: 'Business',
    routes: [
      {
        method: 'GET',
        path: '/business',
        description: 'Get current business details',
        authentication: true,
        response: 'Business object',
      },
      {
        method: 'PATCH',
        path: '/business',
        description: 'Update business details',
        authentication: true,
        requestBody: {
          name: 'string (optional)',
          description: 'string (optional)',
          phone: 'string (optional)',
          email: 'string (optional)',
          settings: 'object (optional)',
        },
        response: 'Updated Business object',
      },
      {
        method: 'GET',
        path: '/business/stats',
        description: 'Get business statistics',
        authentication: true,
        response: {
          totalBookings: 'number',
          totalClients: 'number',
          totalRevenue: 'number',
          pendingBookings: 'number',
          completedBookings: 'number',
        },
      },
    ],
  },
  {
    category: 'Services',
    routes: [
      {
        method: 'GET',
        path: '/services',
        description: 'Get all services for business',
        authentication: true,
        queryParams: {
          active: 'boolean (optional)',
          category: 'string (optional)',
        },
        response: 'Array of Service objects',
      },
      {
        method: 'GET',
        path: '/services/:id',
        description: 'Get single service by ID',
        authentication: true,
        response: 'Service object',
      },
      {
        method: 'POST',
        path: '/services',
        description: 'Create new service',
        authentication: true,
        requestBody: {
          name: 'string (required)',
          description: 'string (optional)',
          duration: 'number (required) - in minutes',
          price: 'number (required)',
          category: 'string (optional)',
          locationIds: 'string[] (optional)',
        },
        response: 'Created Service object',
      },
      {
        method: 'PATCH',
        path: '/services/:id',
        description: 'Update service',
        authentication: true,
        requestBody: {
          name: 'string (optional)',
          price: 'number (optional)',
          active: 'boolean (optional)',
        },
        response: 'Updated Service object',
      },
      {
        method: 'DELETE',
        path: '/services/:id',
        description: 'Delete service',
        authentication: true,
        response: { message: 'string' },
      },
    ],
  },
  {
    category: 'Clients',
    routes: [
      {
        method: 'GET',
        path: '/clients',
        description: 'Get all clients with pagination',
        authentication: true,
        queryParams: {
          search: 'string (optional)',
          locationId: 'string (optional)',
          limit: 'number (optional, default: 50)',
          offset: 'number (optional, default: 0)',
        },
        response: {
          clients: 'Array of Client objects',
          total: 'number',
          limit: 'number',
          offset: 'number',
        },
      },
      {
        method: 'GET',
        path: '/clients/:id',
        description: 'Get single client by ID',
        authentication: true,
        response: 'Client object with booking history',
      },
      {
        method: 'POST',
        path: '/clients',
        description: 'Create new client',
        authentication: true,
        requestBody: {
          name: 'string (required)',
          email: 'string (required)',
          phone: 'string (optional)',
          notes: 'string (optional)',
        },
        response: 'Created Client object',
      },
      {
        method: 'PATCH',
        path: '/clients/:id',
        description: 'Update client',
        authentication: true,
        requestBody: {
          name: 'string (optional)',
          email: 'string (optional)',
          phone: 'string (optional)',
        },
        response: 'Updated Client object',
      },
      {
        method: 'DELETE',
        path: '/clients/:id',
        description: 'Delete client',
        authentication: true,
        response: { message: 'string' },
      },
    ],
  },
  {
    category: 'Bookings',
    routes: [
      {
        method: 'GET',
        path: '/bookings',
        description: 'Get all bookings with filters',
        authentication: true,
        queryParams: {
          status: 'string (optional) - PENDING, CONFIRMED, COMPLETED, CANCELLED',
          paymentStatus: 'string (optional) - PENDING, PAID, FAILED',
          clientId: 'string (optional)',
          serviceId: 'string (optional)',
          startDate: 'string (optional) - ISO date',
          endDate: 'string (optional) - ISO date',
          limit: 'number (optional)',
          offset: 'number (optional)',
        },
        response: {
          bookings: 'Array of Booking objects',
          total: 'number',
        },
      },
      {
        method: 'POST',
        path: '/bookings',
        description: 'Create new booking',
        authentication: true,
        requestBody: {
          clientId: 'string (required)',
          serviceId: 'string (required)',
          startTime: 'string (required) - ISO datetime',
          locationId: 'string (optional)',
          staffId: 'string (optional)',
          notes: 'string (optional)',
        },
        response: 'Created Booking object',
      },
      {
        method: 'PATCH',
        path: '/bookings/:id',
        description: 'Update booking',
        authentication: true,
        requestBody: {
          startTime: 'string (optional)',
          status: 'string (optional)',
          paymentStatus: 'string (optional)',
        },
        response: 'Updated Booking object',
      },
      {
        method: 'POST',
        path: '/bookings/:id/cancel',
        description: 'Cancel booking',
        authentication: true,
        response: 'Cancelled Booking object',
      },
      {
        method: 'GET',
        path: '/bookings/availability/slots',
        description: 'Get available time slots',
        authentication: true,
        queryParams: {
          serviceId: 'string (required)',
          date: 'string (required) - YYYY-MM-DD',
          locationId: 'string (optional)',
          staffId: 'string (optional)',
        },
        response: {
          slots: 'Array of { time: string, available: boolean }',
        },
      },
    ],
  },
  {
    category: 'Payments',
    routes: [
      {
        method: 'POST',
        path: '/payments/subscription/create',
        description: 'Create Stripe subscription checkout',
        authentication: true,
        requestBody: {
          plan: 'string (required) - "pro" or "business"',
          billingPeriod: 'string (required) - "monthly" or "yearly"',
        },
        response: {
          sessionId: 'string',
          url: 'string - Stripe checkout URL',
        },
      },
      {
        method: 'POST',
        path: '/payments/booking/payment',
        description: 'Create payment intent for booking',
        authentication: true,
        requestBody: {
          bookingId: 'string (required)',
        },
        response: {
          clientSecret: 'string',
          paymentIntentId: 'string',
        },
      },
      {
        method: 'POST',
        path: '/payments/webhook',
        description: 'Stripe webhook endpoint',
        authentication: false,
        note: 'Authenticated by Stripe signature',
        response: { received: 'boolean' },
      },
    ],
  },
];

router.get('/routes', (_req, res) => {
  res.json(apiRoutes);
});

export default router;
