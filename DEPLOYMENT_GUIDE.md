# GlamBooking - Production Deployment Guide

## 🚀 Overview

This guide covers deploying the GlamBooking platform to production environments.

**Recommended Stack:**
- Backend: Railway, Render, or Fly.io
- Frontends: Vercel
- Database: Vercel Postgres or Supabase
- Redis: Upstash (already configured)
- Storage: Vercel Blob (already configured)

---

## Prerequisites

✅ All services configured:
- Stripe account with live API keys
- Resend account with verified domain
- Upstash Redis
- Vercel Blob storage
- Custom domains ready

---

## Backend Deployment

### Option 1: Railway (Recommended)

**1. Install Railway CLI:**
```bash
npm install -g @railway/cli
railway login
```

**2. Initialize Project:**
```bash
cd d:\Glammy\backend
railway init
```

**3. Add Database:**
```bash
railway add postgresql
```

**4. Set Environment Variables:**
```bash
railway variables set JWT_SECRET="your-secret"
railway variables set STRIPE_SECRET_KEY="sk_live_..."
railway variables set RESEND_API_KEY="re_..."
railway variables set KV_REST_API_URL="https://..."
railway variables set KV_REST_API_TOKEN="..."
# ... add all other variables from your .env
```

**5. Deploy:**
```bash
railway up
```

**6. Run Migrations:**
```bash
railway run npx prisma migrate deploy
```

**7. Get Backend URL:**
```bash
railway domain
# Example: https://glambooking-backend.up.railway.app
```

### Option 2: Render

**1. Create Web Service:**
- Go to render.com
- New → Web Service
- Connect your GitHub repository

**2. Configure:**
- **Build Command:** `npm install && npx prisma generate && npm run build`
- **Start Command:** `npm start`
- **Environment:** Node

**3. Add Environment Variables:**
Add all variables from your `.env` file in the Environment tab

**4. Add Database:**
- Create PostgreSQL database in Render
- Copy internal database URL to `DATABASE_URL`

**5. Deploy:**
Click "Create Web Service"

---

## Frontend Deployment (Vercel)

### Main Frontend (glambooking.co.uk)

**1. Install Vercel CLI:**
```bash
npm install -g vercel
```

**2. Deploy Main Frontend:**
```bash
cd d:\Glammy\frontend-main
vercel --prod
```

**3. Set Environment Variables in Vercel Dashboard:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_SITE_URL=https://glambooking.co.uk
NEXT_PUBLIC_BEAUTICIANS_URL=https://beauticians.glambooking.co.uk
```

**4. Add Custom Domain:**
- Vercel Dashboard → Settings → Domains
- Add `glambooking.co.uk`
- Update DNS:
  ```
  A     @     76.76.21.21
  ```

### Beauticians Frontend (beauticians.glambooking.co.uk)

**1. Deploy Beauticians Frontend:**
```bash
cd d:\Glammy\frontend-beauticians
vercel --prod
```

**2. Set Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_SITE_URL=https://beauticians.glambooking.co.uk
NEXT_PUBLIC_MAIN_URL=https://glambooking.co.uk
```

**3. Add Custom Domain:**
- Add `beauticians.glambooking.co.uk`
- Update DNS:
  ```
  CNAME beauticians cname.vercel-dns.com
  ```

---

## Database Migration

### From Development to Production

**1. Export Current Schema:**
```bash
npx prisma db pull
```

**2. Generate Migration:**
```bash
npx prisma migrate dev --name production_init
```

**3. Deploy to Production:**
```bash
# Set production database URL
export DATABASE_URL="postgresql://production-url"

# Run migrations
npx prisma migrate deploy
```

---

## Environment Variables Summary

### Backend Production Variables

```bash
# Database
DATABASE_URL="postgresql://production..."
PRISMA_DATABASE_URL="postgresql://production..."

# JWT (use strong secret!)
JWT_SECRET="production-secret-256-bit"

# Server
PORT=4000
NODE_ENV=production

# Stripe LIVE keys
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_PRO_MONTHLY="price_live_..."
STRIPE_PRICE_PRO_YEARLY="price_live_..."
STRIPE_PRICE_BUSINESS_MONTHLY="price_live_..."
STRIPE_PRICE_BUSINESS_YEARLY="price_live_..."

# Redis (Upstash)
KV_REST_API_URL="https://production-redis.upstash.io"
KV_REST_API_TOKEN="production-token"

# Email (Resend with verified domain)
RESEND_API_KEY="re_live_..."
EMAIL_FROM="noreply@glambooking.co.uk"

# Frontend URLs (production)
NEXT_PUBLIC_APP_URL="https://glambooking.co.uk"
FRONTEND_MAIN_URL="https://glambooking.co.uk"
FRONTEND_BEAUTICIANS_URL="https://beauticians.glambooking.co.uk"

# Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### Frontend Production Variables

**Main:**
```bash
NEXT_PUBLIC_API_URL=https://api.glambooking.co.uk
NEXT_PUBLIC_SITE_URL=https://glambooking.co.uk
NEXT_PUBLIC_BEAUTICIANS_URL=https://beauticians.glambooking.co.uk
```

**Beauticians:**
```bash
NEXT_PUBLIC_API_URL=https://api.glambooking.co.uk
NEXT_PUBLIC_SITE_URL=https://beauticians.glambooking.co.uk
NEXT_PUBLIC_MAIN_URL=https://glambooking.co.uk
```

---

## DNS Configuration

### Domain: glambooking.co.uk

```
Type    Name          Value                           TTL
A       @             76.76.21.21                    3600
CNAME   www           cname.vercel-dns.com           3600
CNAME   beauticians   cname.vercel-dns.com           3600
CNAME   api           your-backend.railway.app       3600
```

---

## Stripe Webhook Configuration

**1. Get Webhook Signing Secret:**
- Go to Stripe Dashboard → Developers → Webhooks
- Add endpoint: `https://api.glambooking.co.uk/api/payments/webhook`
- Select events:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `customer.subscription.deleted`
  - `customer.subscription.updated`
- Copy webhook signing secret

**2. Update Backend:**
```bash
railway variables set STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## SSL/HTTPS

Both Vercel and Railway provide automatic SSL certificates:
- ✅ Vercel: Automatic Let's Encrypt
- ✅ Railway: Automatic SSL

Ensure all URLs use `https://` in production.

---

## CORS Configuration

Update backend `src/config/index.ts` for production:

```typescript
cors: {
  origin: [
    'https://glambooking.co.uk',
    'https://www.glambooking.co.uk',
    'https://beauticians.glambooking.co.uk',
  ],
  credentials: true,
},
```

---

## Email Domain Verification

**Resend Setup:**

1. Go to Resend Dashboard → Domains
2. Add domain: `glambooking.co.uk`
3. Add DNS records:
   ```
   TXT  @  resend-verification-code
   MX   @  mx.resend.com
   ```
4. Wait for verification (up to 24 hours)
5. Update `EMAIL_FROM` to use verified domain

---

## Monitoring & Logging

### Recommended Services

**Error Tracking:**
```bash
npm install @sentry/node @sentry/nextjs
```

**Application Monitoring:**
- Railway: Built-in logs and metrics
- Vercel: Built-in analytics
- Uptime monitoring: UptimeRobot or Pingdom

**Database Monitoring:**
- Prisma Studio (read-only in production)
- Database provider dashboard

---

## Backup Strategy

### Database Backups

**Automated (Railway):**
- Enable automatic backups in Railway dashboard
- Schedule: Daily at 2 AM UTC
- Retention: 7 days

**Manual Backup:**
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

**Restore:**
```bash
psql $DATABASE_URL < backup-20241114.sql
```

---

## Security Checklist

- [ ] JWT_SECRET is strong (256-bit minimum)
- [ ] All Stripe keys are LIVE keys
- [ ] CORS restricted to production domains only
- [ ] Rate limiting enabled
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection (React handles this)
- [ ] HTTPS enforced on all domains
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Webhook endpoints verified
- [ ] Email domain verified

---

## Performance Optimization

### Backend

**1. Enable Redis Caching:**
Already implemented in routes (services, bookings, etc.)

**2. Database Connection Pooling:**
Prisma handles this automatically

**3. Rate Limiting:**
Already configured in `src/index.ts`

### Frontend

**1. Next.js Optimization:**
- Image optimization: Use `next/image`
- Font optimization: Use `next/font`
- Bundle analysis: `npm run analyze`

**2. Caching:**
- Static pages cached at edge
- API responses cached via SWR/React Query

**3. CDN:**
Vercel provides global CDN automatically

---

## Scaling Strategy

### Horizontal Scaling

**Backend:**
- Railway: Increase replicas in dashboard
- Load balancing: Automatic

**Database:**
- Connection pooling: Prisma handles
- Read replicas: Configure in database provider

**Redis:**
- Upstash scales automatically

### Vertical Scaling

Increase resources in hosting dashboard as needed.

---

## Rollback Procedure

**Backend:**
```bash
# Railway
railway rollback

# Or deploy previous commit
git checkout <previous-commit>
railway up
```

**Frontend:**
```bash
# Vercel
vercel rollback
```

**Database:**
```bash
# Restore from backup
psql $DATABASE_URL < backup-20241114.sql
```

---

## Post-Deployment Testing

### 1. Health Check
```bash
curl https://api.glambooking.co.uk/health
```

### 2. Test Registration
Visit https://glambooking.co.uk/register

### 3. Test Login
Visit https://glambooking.co.uk/login

### 4. Test Dashboard
Visit https://beauticians.glambooking.co.uk/dashboard

### 5. Test API Endpoints
```bash
curl https://api.glambooking.co.uk/api/services \
  -H "Authorization: Bearer TOKEN"
```

### 6. Test Payment Flow
Create test booking and process payment

### 7. Test Email Delivery
Trigger password reset or booking confirmation

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Review performance metrics
- Check disk usage

**Monthly:**
- Review database size
- Check for security updates
- Update dependencies

**Quarterly:**
- Review backup strategy
- Load testing
- Security audit

---

## Emergency Contacts

- **Stripe Support**: https://support.stripe.com
- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/help
- **Upstash Support**: https://upstash.com/docs

---

## Deployment Timeline

1. **Backend** (1 hour)
   - Deploy to Railway
   - Configure environment
   - Run migrations
   
2. **Database** (30 minutes)
   - Run migrations
   - Verify data

3. **Frontend Main** (30 minutes)
   - Deploy to Vercel
   - Configure domain
   - Test

4. **Frontend Beauticians** (30 minutes)
   - Deploy to Vercel
   - Configure domain
   - Test

5. **DNS Propagation** (24-48 hours)
   - Wait for DNS to propagate
   - Monitor

6. **Final Testing** (1 hour)
   - Complete end-to-end tests
   - Load testing

**Total**: ~4 hours active work + 24-48 hours DNS propagation

---

**Last Updated**: November 2024  
**Version**: 1.0.0
