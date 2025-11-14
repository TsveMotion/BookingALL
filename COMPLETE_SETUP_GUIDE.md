# GlamBooking - Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [Running the Application](#running-the-application)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **PostgreSQL**: v14+ (or use Vercel Postgres/Supabase)
- **Redis**: Upstash Redis account (free tier available)
- **Stripe**: Account with API keys
- **Resend**: Account with API key
- **Git**: For version control

---

## Project Structure

```
d:\Glammy\
├── backend/                    # Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── lib/               # Utilities (auth, email, stripe, redis)
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   ├── validators/        # Request validation
│   │   └── index.ts           # Entry point
│   ├── .env                   # Environment variables (DO NOT COMMIT)
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend-main/             # Main homepage (Next.js)
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   ├── components/        # React components
│   │   └── lib/               # Frontend utilities
│   ├── .env.local             # Environment variables (DO NOT COMMIT)
│   ├── .env.local.example     # Environment template
│   ├── package.json
│   └── next.config.mjs
│
├── frontend-beauticians/      # Beauticians dashboard (Next.js)
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   │   ├── dashboard/    # Dashboard pages
│   │   │   │   ├── page.tsx           # Main dashboard
│   │   │   │   ├── bookings/page.tsx  # Bookings management
│   │   │   │   ├── clients/page.tsx   # Clients management
│   │   │   │   └── services/page.tsx  # Services management
│   │   │   ├── login/        # Login page
│   │   │   ├── register/     # Register page
│   │   │   ├── page.tsx      # Landing page
│   │   │   └── layout.tsx
│   │   ├── components/        # React components
│   │   ├── lib/               # Frontend utilities
│   │   └── middleware.ts      # Auth protection
│   ├── .env.local
│   ├── package.json
│   └── next.config.mjs
│
├── shared/                    # Shared code between frontends
│   ├── api/
│   │   └── client.ts          # API SDK
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── hooks/
│   │   └── useAuth.ts         # Auth hook
│   ├── utils/
│   │   ├── formatters.ts      # Formatting utilities
│   │   └── validation.ts      # Validation utilities
│   └── constants/
│       └── index.ts           # Constants
│
├── README.md
├── SETUP.md
├── API_DOCUMENTATION.md
└── install-all.ps1            # Automated installation script
```

---

## Backend Setup

### 1. Install Dependencies

```powershell
cd d:\Glammy\backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/glambooking"
PRISMA_DATABASE_URL="postgresql://user:password@localhost:5432/glambooking"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-here"

# Server
PORT=4000
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_PRO_MONTHLY="price_..."
STRIPE_PRICE_PRO_YEARLY="price_..."
STRIPE_PRICE_BUSINESS_MONTHLY="price_..."
STRIPE_PRICE_BUSINESS_YEARLY="price_..."

# Redis (Upstash)
KV_REST_API_URL="https://your-redis.upstash.io"
KV_REST_API_TOKEN="your-upstash-token"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@glambooking.co.uk"

# Frontend URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
FRONTEND_MAIN_URL="http://localhost:3000"
FRONTEND_BEAUTICIANS_URL="http://localhost:3001"

# Blob Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

### 3. Setup Database

```powershell
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

### 4. Start Backend

```powershell
# Development mode with auto-reload
npm run dev

# Production mode
npm run build
npm start
```

Backend will run on: **http://localhost:4000**

---

## Frontend Setup

### Main Frontend (glambooking.co.uk)

```powershell
cd d:\Glammy\frontend-main
npm install
```

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BEAUTICIANS_URL=http://localhost:3001
```

Start:
```powershell
npm run dev
```

Runs on: **http://localhost:3000**

### Beauticians Frontend (beauticians.glambooking.co.uk)

```powershell
cd d:\Glammy\frontend-beauticians
npm install
```

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_MAIN_URL=http://localhost:3000
```

Start:
```powershell
npm run dev
```

Runs on: **http://localhost:3001**

---

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE glambooking;
```
3. Update `DATABASE_URL` in backend `.env`

### Option 2: Vercel Postgres

1. Create project on Vercel
2. Add Postgres database
3. Copy connection string to `DATABASE_URL`

### Option 3: Supabase

1. Create project on Supabase
2. Get connection string from Settings > Database
3. Use direct connection string for `DATABASE_URL`

---

## Environment Variables

### Backend (.env)

All the variables you provided are already configured in your `.env` file:

```bash
DATABASE_URL="postgresql://..."          # ✓ Your Prisma.io database
JWT_SECRET="..."                         # ✓ Configured
STRIPE_SECRET_KEY="..."                  # ✓ Your Stripe key
STRIPE_WEBHOOK_SECRET="..."              # ✓ Configured
STRIPE_PRICE_PRO_MONTHLY="..."          # ✓ Configured
KV_REST_API_URL="..."                   # ✓ Your Upstash Redis
KV_REST_API_TOKEN="..."                 # ✓ Configured
RESEND_API_KEY="..."                    # ✓ Your Resend key
BLOB_READ_WRITE_TOKEN="..."             # ✓ Your Vercel Blob
```

### Frontend Main (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BEAUTICIANS_URL=http://localhost:3001
```

### Frontend Beauticians (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_MAIN_URL=http://localhost:3000
```

---

## Running the Application

### Quick Start (Automated)

Run the installation script:
```powershell
.\install-all.ps1
```

Then start all services:
```powershell
.\start-all.ps1
```

### Manual Start

Open **3 separate terminals**:

**Terminal 1 - Backend:**
```powershell
cd d:\Glammy\backend
npm run dev
```

**Terminal 2 - Main Frontend:**
```powershell
cd d:\Glammy\frontend-main
npm run dev
```

**Terminal 3 - Beauticians Frontend:**
```powershell
cd d:\Glammy\frontend-beauticians
npm run dev
```

### Access URLs

- **Backend API**: http://localhost:4000
- **Main Site**: http://localhost:3000
- **Beauticians Dashboard**: http://localhost:3001
- **API Health**: http://localhost:4000/health

---

## Testing

### Test Registration Flow

1. Visit http://localhost:3000
2. Click "Get Started Free"
3. Fill in registration form:
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`
   - Business Name: `Test Beauty Studio`
   - Category: `Beautician`
4. Submit → You'll be redirected to http://localhost:3001/dashboard

### Test Login Flow

1. Visit http://localhost:3000/login
2. Login with credentials
3. You'll be redirected based on your business category

### Test Dashboard Features

1. Navigate to Bookings: http://localhost:3001/dashboard/bookings
2. Navigate to Clients: http://localhost:3001/dashboard/clients
3. Navigate to Services: http://localhost:3001/dashboard/services

### Test API Directly

```bash
# Health check
curl http://localhost:4000/health

# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "businessName": "Test Studio",
    "category": "BEAUTICIAN"
  }'

# Get services (requires token)
curl http://localhost:4000/api/services \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Deployment

### Backend (Railway/Render/Fly.io)

1. Push code to GitHub
2. Connect repository to hosting provider
3. Set environment variables
4. Deploy

**Railway Example:**
```bash
railway login
railway init
railway add
railway up
```

### Frontends (Vercel)

**Main Frontend:**
```bash
cd frontend-main
vercel --prod
```

**Beauticians Frontend:**
```bash
cd frontend-beauticians
vercel --prod
```

Set environment variables in Vercel dashboard.

### Custom Domains

1. Add custom domains in Vercel:
   - Main: `glambooking.co.uk`
   - Beauticians: `beauticians.glambooking.co.uk`

2. Update DNS records:
   ```
   A     @               76.76.21.21
   CNAME beauticians     cname.vercel-dns.com
   ```

3. Update environment variables with production URLs

---

## Troubleshooting

### Port Already in Use

```powershell
# Kill process on port
npx kill-port 4000   # Backend
npx kill-port 3000   # Main frontend
npx kill-port 3001   # Beauticians
```

### Database Connection Errors

1. Check `DATABASE_URL` is correct
2. Ensure database exists
3. Run migrations: `npx prisma migrate dev`
4. Check network connectivity

### Prisma Client Not Generated

```powershell
cd backend
npx prisma generate
```

### CORS Errors

1. Check backend CORS configuration in `src/config/index.ts`
2. Ensure frontend URLs are in allowed origins
3. Check that cookies are being sent with requests

### Token/Authentication Issues

1. Clear browser localStorage
2. Clear cookies
3. Check JWT_SECRET is set in backend
4. Verify token expiration times

### Module Not Found Errors

```powershell
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```powershell
# Check for errors
npm run type-check

# If in frontend, ensure all dependencies are installed
npm install @types/node @types/react @types/react-dom
```

### Stripe Webhook Issues

1. Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:4000/api/payments/webhook
```

2. Update `STRIPE_WEBHOOK_SECRET` with the signing secret from CLI

### Email Not Sending

1. Verify Resend API key is valid
2. Check email sending limits
3. Ensure `EMAIL_FROM` domain is verified in Resend

---

## Development Tips

### Database Management

```powershell
# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name your_migration_name

# View current schema
npx prisma db pull
```

### Code Quality

```powershell
# Type checking
npm run type-check

# Linting (if configured)
npm run lint

# Format code (if configured)
npm run format
```

### Monitoring

- Backend logs: Check terminal output
- Frontend logs: Browser console
- API requests: Browser Network tab
- Database: Prisma Studio

---

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] JWT_SECRET is strong and secure
- [ ] CORS origins restricted to production URLs
- [ ] Rate limiting configured
- [ ] Email templates tested
- [ ] Stripe webhooks configured
- [ ] SSL certificates configured
- [ ] Custom domains configured
- [ ] Backup strategy in place
- [ ] Monitoring/logging configured
- [ ] Error tracking (e.g., Sentry) configured

---

## Support

For issues or questions:
1. Check this guide
2. Check API_DOCUMENTATION.md
3. Check code comments
4. Review error logs

---

**Last Updated**: November 2024  
**Version**: 1.0.0
