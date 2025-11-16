import api from './api';

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  avatar: string | null;
  emailVerified: boolean;
  business: {
    id: string;
    name: string;
    slug: string;
    category: string;
    plan: string;
    logo: string | null;
  } | null;
  subscription?: {
    plan: string;
    status: string;
    currentPeriodEnd: string;
  } | null;
  lastLoginAt: Date | null;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}
