import { useState, useEffect } from 'react';
import { GlamBookingAPI } from '../api/client';
import type { User } from '../types';

export function useAuth(api: GlamBookingAPI) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userData = await api.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load user:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      setLoading(true);
      const response = await api.login({ email, password });
      setUser(response.user);
      setError(null);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function register(data: any) {
    try {
      setLoading(true);
      const response = await api.register(data);
      setUser(response.user);
      setError(null);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api.logout();
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  }

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    refetch: loadUser,
  };
}
