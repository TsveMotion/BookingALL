import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Business,
  Service,
  Client,
  Booking,
  AuthResponse,
  RegisterData,
  LoginData,
  BusinessStats,
  ClientStats,
  CreateServiceData,
  UpdateServiceData,
  CreateClientData,
  UpdateClientData,
  CreateBookingData,
  UpdateBookingData,
  AvailabilityResponse,
} from '../types';

export class GlamBookingAPI {
  private client: AxiosInstance;
  private tokenStorage: {
    getToken: () => string | null;
    setToken: (token: string) => void;
    getRefreshToken: () => string | null;
    setRefreshToken: (token: string) => void;
    clearTokens: () => void;
  };

  constructor(
    baseURL: string,
    tokenStorage?: {
      getToken: () => string | null;
      setToken: (token: string) => void;
      getRefreshToken: () => string | null;
      setRefreshToken: (token: string) => void;
      clearTokens: () => void;
    }
  ) {
    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Default token storage using localStorage
    this.tokenStorage = tokenStorage || {
      getToken: () => typeof window !== 'undefined' ? localStorage.getItem('token') : null,
      setToken: (token: string) => typeof window !== 'undefined' && localStorage.setItem('token', token),
      getRefreshToken: () => typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
      setRefreshToken: (token: string) => typeof window !== 'undefined' && localStorage.setItem('refreshToken', token),
      clearTokens: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      },
    };

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use((config) => {
      const token = this.tokenStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.tokenStorage.getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token');

            const response = await axios.post(`${this.client.defaults.baseURL}/auth/refresh`, {
              refreshToken,
            });

            const { token: newToken, refreshToken: newRefreshToken } = response.data.session;
            this.tokenStorage.setToken(newToken);
            this.tokenStorage.setRefreshToken(newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.tokenStorage.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth API
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    this.tokenStorage.setToken(response.data.session.token);
    this.tokenStorage.setRefreshToken(response.data.session.refreshToken);
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    this.tokenStorage.setToken(response.data.session.token);
    this.tokenStorage.setRefreshToken(response.data.session.refreshToken);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.tokenStorage.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  async verifyEmail(token: string): Promise<void> {
    await this.client.post('/auth/verify-email', { token });
  }

  async forgotPassword(email: string): Promise<void> {
    await this.client.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await this.client.post('/auth/reset-password', { token, password });
  }

  // Business API
  async getBusiness(): Promise<Business> {
    const response = await this.client.get<Business>('/business');
    return response.data;
  }

  async updateBusiness(data: Partial<Business>): Promise<Business> {
    const response = await this.client.patch<Business>('/business', data);
    return response.data;
  }

  async getBusinessStats(): Promise<BusinessStats> {
    const response = await this.client.get<BusinessStats>('/business/stats');
    return response.data;
  }

  // Services API
  async getServices(params?: { active?: boolean; category?: string }): Promise<Service[]> {
    const response = await this.client.get<Service[]>('/services', { params });
    return response.data;
  }

  async getService(id: string): Promise<Service> {
    const response = await this.client.get<Service>(`/services/${id}`);
    return response.data;
  }

  async createService(data: CreateServiceData): Promise<Service> {
    const response = await this.client.post<Service>('/services', data);
    return response.data;
  }

  async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    const response = await this.client.patch<Service>(`/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: string): Promise<void> {
    await this.client.delete(`/services/${id}`);
  }

  // Clients API
  async getClients(params?: {
    search?: string;
    locationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ clients: Client[]; total: number; limit: number; offset: number }> {
    const response = await this.client.get('/clients', { params });
    return response.data;
  }

  async getClient(id: string): Promise<Client> {
    const response = await this.client.get<Client>(`/clients/${id}`);
    return response.data;
  }

  async createClient(data: CreateClientData): Promise<Client> {
    const response = await this.client.post<Client>('/clients', data);
    return response.data;
  }

  async updateClient(id: string, data: UpdateClientData): Promise<Client> {
    const response = await this.client.patch<Client>(`/clients/${id}`, data);
    return response.data;
  }

  async deleteClient(id: string): Promise<void> {
    await this.client.delete(`/clients/${id}`);
  }

  async getClientStats(id: string): Promise<ClientStats> {
    const response = await this.client.get<ClientStats>(`/clients/${id}/stats`);
    return response.data;
  }

  // Bookings API
  async getBookings(params?: {
    status?: string;
    paymentStatus?: string;
    clientId?: string;
    serviceId?: string;
    locationId?: string;
    staffId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ bookings: Booking[]; total: number; limit: number; offset: number }> {
    const response = await this.client.get('/bookings', { params });
    return response.data;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.client.get<Booking>(`/bookings/${id}`);
    return response.data;
  }

  async createBooking(data: CreateBookingData): Promise<Booking> {
    const response = await this.client.post<Booking>('/bookings', data);
    return response.data;
  }

  async updateBooking(id: string, data: UpdateBookingData): Promise<Booking> {
    const response = await this.client.patch<Booking>(`/bookings/${id}`, data);
    return response.data;
  }

  async cancelBooking(id: string): Promise<Booking> {
    const response = await this.client.post<Booking>(`/bookings/${id}/cancel`);
    return response.data;
  }

  async deleteBooking(id: string): Promise<void> {
    await this.client.delete(`/bookings/${id}`);
  }

  async getAvailability(params: {
    serviceId: string;
    date: string;
    locationId?: string;
    staffId?: string;
  }): Promise<AvailabilityResponse> {
    const response = await this.client.get<AvailabilityResponse>('/bookings/availability/slots', { params });
    return response.data;
  }

  // Payments API
  async createSubscriptionCheckout(plan: 'pro' | 'business', billingPeriod: 'monthly' | 'yearly'): Promise<{ sessionId: string; url: string }> {
    const response = await this.client.post('/payments/subscription/create', { plan, billingPeriod });
    return response.data;
  }

  async createBookingPayment(bookingId: string): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const response = await this.client.post('/payments/booking/payment', { bookingId });
    return response.data;
  }

  async cancelSubscription(): Promise<void> {
    await this.client.post('/payments/subscription/cancel');
  }
}

// Export singleton instance
let apiInstance: GlamBookingAPI | null = null;

export function initializeAPI(baseURL: string) {
  apiInstance = new GlamBookingAPI(baseURL);
  return apiInstance;
}

export function getAPI(): GlamBookingAPI {
  if (!apiInstance) {
    throw new Error('API not initialized. Call initializeAPI first.');
  }
  return apiInstance;
}

export default GlamBookingAPI;
