# Frontend Booking - GlamBooking Public Booking Pages

Public-facing booking pages for clients to book appointments with businesses.

## Features

- Browse services by business slug
- Real-time availability checking
- Book appointments online
- Stripe payment integration
- Email confirmations
- Mobile-responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Payments**: Stripe
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on port 4000

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

## Routes

- `/business/[slug]` - Business overview and services
- `/business/[slug]/services/[serviceId]` - Service booking page
- `/business/[slug]/checkout` - Payment and confirmation
- `/business/[slug]/success` - Booking success page

## API Integration

All data is fetched from the backend API:

- `GET /api/booking-page/public/:slug` - Get business and services
- `GET /api/booking-page/public/:slug/availability` - Get available time slots
- `POST /api/bookings/public/create` - Create booking

## Deployment

```bash
npm run build
npm start
```

## License

Proprietary - GlamBooking © 2025
