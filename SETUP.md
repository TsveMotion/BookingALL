# GlamBooking - Complete Setup Guide

## 🚀 Quick Installation (Windows)

Run these commands in PowerShell:

### 1. Install Backend Dependencies & Setup Database

```powershell
cd d:\Glammy\backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### 2. Install Main Frontend Dependencies

```powershell
cd d:\Glammy\frontend-main
npm install
```

### 3. Install Beauticians Frontend Dependencies

```powershell
cd d:\Glammy\frontend-beauticians
npm install
```

## ▶️ Running the Platform

Open **3 separate PowerShell terminals**:

### Terminal 1: Backend API

```powershell
cd d:\Glammy\backend
npm run dev
```

✅ Backend running on: http://localhost:4000

### Terminal 2: Main Frontend

```powershell
cd d:\Glammy\frontend-main
npm run dev
```

✅ Main site running on: http://localhost:3000

### Terminal 3: Beauticians Frontend

```powershell
cd d:\Glammy\frontend-beauticians
npm run dev
```

✅ Beauticians site running on: http://localhost:3001

## 🧪 Testing the Full Flow

1. **Visit Main Homepage**: http://localhost:3000
2. **Click "Get Started Free"**: http://localhost:3000/register
3. **Register a new account**:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
   - Business Name: My Beauty Studio
   - Category: **Beautician**
   - Submit

4. **Automatic Redirect**: You'll be redirected to http://localhost:3001/dashboard
5. **Dashboard**: You'll see your beauticians dashboard with stats

## 🔄 Testing Login Flow

1. **Visit**: http://localhost:3000/login
2. **Login** with your credentials
3. **Automatic Redirect**: Based on your business category, you'll be sent to the right dashboard

## ✅ What Should Work

- ✅ User registration with business category
- ✅ User login with JWT authentication
- ✅ Automatic category-based dashboard routing
- ✅ Beauticians dashboard with stats display
- ✅ Protected routes (try accessing /dashboard without logging in)
- ✅ Session management with refresh tokens
- ✅ Beautiful, responsive UI on all pages

## 🐛 Common Issues & Solutions

### "Port already in use"
```powershell
# Kill processes
npx kill-port 4000
npx kill-port 3000
npx kill-port 3001
```

### "Cannot find module"
```powershell
# Reinstall dependencies in the specific project
npm install
```

### "Prisma Client not generated"
```powershell
cd d:\Glammy\backend
npx prisma generate
```

### Database migration errors
```powershell
cd d:\Glammy\backend
npx prisma migrate reset
npx prisma migrate dev --name init
```

### CORS errors
Check that your backend .env has:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📝 Environment Check

Make sure your `d:\Glammy\backend\.env` has these key variables:
- ✅ DATABASE_URL
- ✅ JWT_SECRET
- ✅ STRIPE_SECRET_KEY (from your existing .env)
- ✅ KV_REST_API_URL (Upstash Redis)
- ✅ KV_REST_API_TOKEN (Upstash Redis)
- ✅ RESEND_API_KEY

## 🎯 Next Steps

Once everything is running:

1. **Test Registration**: Create multiple accounts with different categories
2. **Test Login**: Login from different frontends
3. **Test Dashboard**: View stats and navigation
4. **Build Features**: Add booking management, client management, etc.

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Backend API (Port 4000)             │
│   • Authentication (JWT)                     │
│   • Multi-tenant Database                    │
│   • Business Logic                           │
│   • Upstash Redis Caching                    │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼────────┐
│  Main Frontend │    │   Beauticians   │
│  (Port 3000)   │    │   Frontend      │
│                │    │   (Port 3001)   │
│  • Homepage    │    │  • Landing Page │
│  • Login       │    │  • Dashboard    │
│  • Register    │    │  • Bookings     │
└────────────────┘    └─────────────────┘
```

## 🎨 UI Features

- **Modern Design**: Gradient backgrounds, smooth animations
- **Responsive**: Works on mobile, tablet, desktop
- **Fast**: Optimized with caching and SSR
- **SEO Ready**: Proper meta tags and descriptions
- **Accessible**: Semantic HTML and ARIA labels

## 💡 Tips

- Use **Chrome DevTools** to debug authentication
- Check **Network tab** to see API requests
- Use **Application > Local Storage** to see tokens
- Check **Console** for any errors

---

Happy coding! 🚀
