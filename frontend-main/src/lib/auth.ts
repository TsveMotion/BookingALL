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
  lastLoginAt: Date | null;
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

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post('/auth/register', data);
  
  // Store tokens in localStorage and cookies
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', response.data.session.token);
    localStorage.setItem('refreshToken', response.data.session.refreshToken);
    
    // Also set in cookies for SSR
    document.cookie = `token=${response.data.session.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
  }
  
  return response.data;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await api.post('/auth/login', data);
  
  // Store tokens in localStorage and cookies
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', response.data.session.token);
    localStorage.setItem('refreshToken', response.data.session.refreshToken);
    
    // Also set in cookies for SSR
    document.cookie = `token=${response.data.session.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
  }
  
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      document.cookie = 'token=; path=/; max-age=0';
    }
  }
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get('/auth/me');
  return response.data;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}
