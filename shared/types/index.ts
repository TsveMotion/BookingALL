// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'OWNER' | 'MANAGER' | 'STAFF' | 'ADMIN';
  avatar: string | null;
  emailVerified: boolean;
  business: Business | null;
  businessId: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Business types
export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  currency: string;
  timezone: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  trialEndsAt: Date | null;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
}

// Service types
export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  currency: string;
  category: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  locations?: ServiceLocation[];
  _count?: {
    bookings: number;
  };
}

export interface ServiceLocation {
  serviceId: string;
  locationId: string;
  location: Location;
}

// Location types
export interface Location {
  id: string;
  businessId: string;
  name: string;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  timezone: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Client types
export interface Client {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone: string | null;
  birthday: Date | null;
  notes: string | null;
  tags: string[];
  locationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    bookings: number;
  };
}

// Booking types
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'card' | 'cash' | 'bank_transfer';

export interface Booking {
  id: string;
  businessId: string;
  clientId: string;
  serviceId: string;
  locationId: string | null;
  staffId: string | null;
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentIntentId: string | null;
  stripeChargeId: string | null;
  notes: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  service?: Service;
  location?: Location;
  createdBy?: Partial<User>;
}

// Auth types
export interface AuthResponse {
  user: User;
  session: {
    token: string;
    refreshToken: string;
    expiresAt: string;
  };
  dashboardUrl: string;
  category: string | null;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  businessName: string;
  category: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Stats types
export interface BusinessStats {
  totalBookings: number;
  totalClients: number;
  totalRevenue: number;
  pendingBookings: number;
  completedBookings: number;
}

export interface ClientStats {
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  lastBooking: Booking | null;
}

// API Response types
export interface ApiError {
  error: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Form types
export interface CreateServiceData {
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  locationIds?: string[];
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  category?: string;
  active?: boolean;
  locationIds?: string[];
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  birthday?: string;
  notes?: string;
  tags?: string[];
  locationId?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  notes?: string;
  tags?: string[];
  locationId?: string;
}

export interface CreateBookingData {
  clientId: string;
  serviceId: string;
  locationId?: string;
  staffId?: string;
  startTime: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
}

export interface UpdateBookingData {
  startTime?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
  staffId?: string;
}

// Availability types
export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AvailabilityResponse {
  slots: TimeSlot[];
}
