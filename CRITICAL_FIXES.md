# Critical Fixes Required

## 1. Database Schema Migration (HIGH PRIORITY)

The `BookingPageSettings` table is missing from the database.

**Fix:**
```powershell
cd backend
npx prisma db push
npx prisma generate
```

After running this, restart the backend server.

## 2. Authentication Token Issues (HIGH PRIORITY)

The frontend is getting 401 Unauthorized errors because tokens aren't being passed correctly.

**Check:**
- Open browser DevTools → Application → Local Storage
- Verify `token` and `refreshToken` exist
- If missing, log out and log back in

**If still failing:**
- Clear browser cache and cookies
- Login again from `http://localhost:3000/login`
- You should be redirected to `http://localhost:3001/dashboard` with tokens

## 3. Missing Dependencies

Ensure axios is installed in backend:
```powershell
cd backend
npm install axios
```

## 4. Start All Services

You need 3 terminals running:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Main Frontend:**
```powershell
cd frontend-main
npm run dev
```

**Terminal 3 - Beauticians Dashboard:**
```powershell
cd frontend-beauticians
npm run dev
```

**Terminal 4 - Public Booking (Optional):**
```powershell
cd frontend-booking
npm run dev
```

## 5. Verify Services Are Running

- Backend: http://localhost:4000/health
- Main: http://localhost:3000
- Dashboard: http://localhost:3001
- Booking: http://localhost:3002

## 6. Environment Variables

Ensure all `.env` files are configured:

### backend/.env
```
DATABASE_URL="your-database-url"
JWT_SECRET="your-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
STRIPE_SECRET_KEY="your-stripe-key"
```

### frontend-beauticians/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_MAIN_URL=http://localhost:3000
NEXT_PUBLIC_BOOKING_URL=http://localhost:3002
```

### frontend-booking/.env.local
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

## Common Errors & Solutions

### "Cannot find module 'axios'"
```powershell
cd backend
npm install axios
```

### "Table BookingPageSettings does not exist"
```powershell
cd backend
npx prisma db push
npx prisma generate
# Restart backend
```

### "401 Unauthorized"
1. Clear browser storage
2. Login again from http://localhost:3000/login
3. Check that tokens are saved in localStorage
4. Verify backend is running on port 4000

### CORS Errors
Backend is configured to allow:
- http://localhost:3000
- http://localhost:3001
- http://localhost:3002
- http://localhost:4000

If you change ports, update backend CORS config.

## Testing the System

1. **Register/Login** at http://localhost:3000
2. **Access Dashboard** at http://localhost:3001/dashboard
3. **View Booking Page** - Check dashboard for your booking link
4. **Test Public Booking** - Visit booking link as a client
5. **Create Booking** - Complete a test booking

## Need Help?

Check logs in each terminal for specific error messages.
