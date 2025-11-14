# GlamBooking API Documentation

Complete API reference for the GlamBooking platform backend.

**Base URL**: `http://localhost:4000/api`

---

## Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Register
**POST** `/auth/register`

Create a new user account and business.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "businessName": "Beautiful Studio",
  "category": "BEAUTICIAN",
  "phone": "+44 7700 900000"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "OWNER",
    "business": { ... }
  },
  "session": {
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresAt": "2024-12-01T00:00:00Z"
  },
  "dashboardUrl": "http://localhost:3001/dashboard",
  "category": "BEAUTICIAN"
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK` (same structure as register)

### Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "session": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresAt": "2024-12-01T00:00:00Z"
  }
}
```

### Logout
**POST** `/auth/logout`

Requires authentication.

**Response:** `200 OK`

### Get Current User
**GET** `/auth/me`

Requires authentication.

**Response:** `200 OK`
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "OWNER",
  "business": { ... }
}
```

### Verify Email
**POST** `/auth/verify-email`

**Request Body:**
```json
{
  "token": "verification_token"
}
```

**Response:** `200 OK`

### Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`

### Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newpassword123"
}
```

**Response:** `200 OK`

---

## Business

### Get Business
**GET** `/business`

Requires authentication.

**Response:** `200 OK`
```json
{
  "id": "business_id",
  "name": "Beautiful Studio",
  "slug": "beautiful-studio",
  "category": "BEAUTICIAN",
  "plan": "PRO",
  "email": "info@beautifulstudio.com",
  "phone": "+44 7700 900000",
  ...
}
```

### Update Business
**PATCH** `/business`

Requires authentication.

**Request Body:**
```json
{
  "name": "New Business Name",
  "description": "Updated description",
  "phone": "+44 7700 900001",
  "email": "new@email.com"
}
```

**Response:** `200 OK` (updated business object)

### Get Business Stats
**GET** `/business/stats`

Requires authentication.

**Response:** `200 OK`
```json
{
  "totalBookings": 150,
  "totalClients": 45,
  "totalRevenue": 4500.00,
  "pendingBookings": 8,
  "completedBookings": 120
}
```

---

## Services

### Get All Services
**GET** `/services`

Requires authentication.

**Query Parameters:**
- `active` (boolean): Filter by active status
- `category` (string): Filter by category

**Response:** `200 OK`
```json
[
  {
    "id": "service_id",
    "name": "Facial Treatment",
    "description": "Deep cleansing facial",
    "duration": 60,
    "price": 65.00,
    "category": "Facial",
    "active": true,
    "_count": {
      "bookings": 45
    }
  }
]
```

### Get Single Service
**GET** `/services/:id`

Requires authentication.

**Response:** `200 OK` (service object)

### Create Service
**POST** `/services`

Requires authentication.

**Request Body:**
```json
{
  "name": "Manicure",
  "description": "Classic manicure with polish",
  "duration": 45,
  "price": 35.00,
  "category": "Nails",
  "locationIds": ["location_id_1"]
}
```

**Response:** `201 Created` (service object)

### Update Service
**PATCH** `/services/:id`

Requires authentication.

**Request Body:**
```json
{
  "name": "Updated Name",
  "price": 40.00,
  "active": true
}
```

**Response:** `200 OK` (updated service object)

### Delete Service
**DELETE** `/services/:id`

Requires authentication.

**Response:** `200 OK`

---

## Clients

### Get All Clients
**GET** `/clients`

Requires authentication.

**Query Parameters:**
- `search` (string): Search by name, email, or phone
- `locationId` (string): Filter by location
- `limit` (number): Results per page (default: 50)
- `offset` (number): Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "clients": [
    {
      "id": "client_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+44 7700 900000",
      "birthday": "1990-05-15T00:00:00Z",
      "notes": "Prefers natural products",
      "tags": ["vip", "regular"],
      "_count": {
        "bookings": 12
      }
    }
  ],
  "total": 45,
  "limit": 50,
  "offset": 0
}
```

### Get Single Client
**GET** `/clients/:id`

Requires authentication.

**Response:** `200 OK` (client object with recent bookings)

### Create Client
**POST** `/clients`

Requires authentication.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+44 7700 900000",
  "birthday": "1990-05-15",
  "notes": "Prefers natural products",
  "tags": ["vip"]
}
```

**Response:** `201 Created` (client object)

### Update Client
**PATCH** `/clients/:id`

Requires authentication.

**Request Body:**
```json
{
  "name": "Jane Smith-Jones",
  "phone": "+44 7700 900001",
  "tags": ["vip", "regular"]
}
```

**Response:** `200 OK` (updated client object)

### Delete Client
**DELETE** `/clients/:id`

Requires authentication.

**Response:** `200 OK`

### Get Client Stats
**GET** `/clients/:id/stats`

Requires authentication.

**Response:** `200 OK`
```json
{
  "totalBookings": 12,
  "completedBookings": 10,
  "totalSpent": 450.00,
  "lastBooking": { ... }
}
```

---

## Bookings

### Get All Bookings
**GET** `/bookings`

Requires authentication.

**Query Parameters:**
- `status` (string): PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
- `paymentStatus` (string): PENDING, PAID, FAILED, REFUNDED
- `clientId` (string): Filter by client
- `serviceId` (string): Filter by service
- `locationId` (string): Filter by location
- `staffId` (string): Filter by staff
- `startDate` (string): Filter from date (ISO format)
- `endDate` (string): Filter to date (ISO format)
- `limit` (number): Results per page (default: 50)
- `offset` (number): Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "bookings": [
    {
      "id": "booking_id",
      "startTime": "2024-12-01T10:00:00Z",
      "endTime": "2024-12-01T11:00:00Z",
      "status": "CONFIRMED",
      "paymentStatus": "PAID",
      "totalAmount": 65.00,
      "client": { ... },
      "service": { ... },
      "location": { ... }
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### Get Single Booking
**GET** `/bookings/:id`

Requires authentication.

**Response:** `200 OK` (booking object)

### Create Booking
**POST** `/bookings`

Requires authentication.

**Request Body:**
```json
{
  "clientId": "client_id",
  "serviceId": "service_id",
  "locationId": "location_id",
  "staffId": "staff_id",
  "startTime": "2024-12-01T10:00:00Z",
  "notes": "Client prefers quiet room",
  "paymentMethod": "card"
}
```

**Response:** `201 Created` (booking object)

### Update Booking
**PATCH** `/bookings/:id`

Requires authentication.

**Request Body:**
```json
{
  "startTime": "2024-12-01T11:00:00Z",
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "notes": "Updated notes"
}
```

**Response:** `200 OK` (updated booking object)

### Cancel Booking
**POST** `/bookings/:id/cancel`

Requires authentication.

**Response:** `200 OK` (cancelled booking object)

### Delete Booking
**DELETE** `/bookings/:id`

Requires authentication.

**Response:** `200 OK`

### Get Availability
**GET** `/bookings/availability/slots`

Requires authentication.

**Query Parameters:**
- `serviceId` (string, required): Service to check availability for
- `date` (string, required): Date in ISO format (YYYY-MM-DD)
- `locationId` (string, optional): Location to check
- `staffId` (string, optional): Staff member to check

**Response:** `200 OK`
```json
{
  "slots": [
    {
      "time": "2024-12-01T09:00:00Z",
      "available": true
    },
    {
      "time": "2024-12-01T09:30:00Z",
      "available": false
    }
  ]
}
```

---

## Payments

### Create Subscription Checkout
**POST** `/payments/subscription/create`

Requires authentication.

**Request Body:**
```json
{
  "plan": "pro",
  "billingPeriod": "monthly"
}
```

**Response:** `200 OK`
```json
{
  "sessionId": "stripe_session_id",
  "url": "https://checkout.stripe.com/..."
}
```

### Create Booking Payment
**POST** `/payments/booking/payment`

Requires authentication.

**Request Body:**
```json
{
  "bookingId": "booking_id"
}
```

**Response:** `200 OK`
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_..."
}
```

### Cancel Subscription
**POST** `/payments/subscription/cancel`

Requires authentication.

**Response:** `200 OK`

### Webhook
**POST** `/payments/webhook`

Stripe webhook endpoint (no authentication required, validated by signature).

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

- General API: 100 requests per 15 minutes per IP
- Authentication endpoints: 10 requests per 15 minutes per IP

---

## Examples

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "businessName": "Beautiful Studio",
    "category": "BEAUTICIAN"
  }'
```

**Get Services:**
```bash
curl http://localhost:4000/api/services \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Booking:**
```bash
curl -X POST http://localhost:4000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client_id",
    "serviceId": "service_id",
    "startTime": "2024-12-01T10:00:00Z"
  }'
```

---

## WebSocket (Future)

Real-time booking updates and notifications will be available via WebSocket in future versions.

---

**Version:** 1.0.0  
**Last Updated:** November 2024
