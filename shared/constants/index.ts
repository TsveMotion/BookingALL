export const BUSINESS_CATEGORIES = [
  { value: 'BEAUTICIAN', label: 'Beautician' },
  { value: 'HAIRDRESSER', label: 'Hairdresser' },
  { value: 'BARBER', label: 'Barber' },
  { value: 'NAIL_TECH', label: 'Nail Technician' },
  { value: 'MASSAGE', label: 'Massage Therapist' },
  { value: 'SPA', label: 'Spa & Wellness' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const BOOKING_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'blue' },
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  { value: 'NO_SHOW', label: 'No Show', color: 'gray' },
] as const;

export const PAYMENT_STATUSES = [
  { value: 'PENDING', label: 'Pending', color: 'yellow' },
  { value: 'PAID', label: 'Paid', color: 'green' },
  { value: 'FAILED', label: 'Failed', color: 'red' },
  { value: 'REFUNDED', label: 'Refunded', color: 'gray' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
] as const;

export const ROLES = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'STAFF', label: 'Staff' },
] as const;

export const PLANS = [
  { value: 'FREE', label: 'Free', price: 0 },
  { value: 'PRO', label: 'Pro', price: 29 },
  { value: 'BUSINESS', label: 'Business', price: 79 },
] as const;

export { DASHBOARD_URLS, getDashboardUrl } from './dashboard-urls';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
