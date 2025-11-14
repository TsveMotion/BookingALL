'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, DollarSign, Users, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
  };
  bookings: {
    total: number;
    growth: number;
  };
  clients: {
    total: number;
    growth: number;
  };
  avgBookingValue: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  async function loadAnalytics() {
    try {
      const response = await api.get('/analytics', { params: { period } });
      setData(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Initialize with zeros if API fails
      setData({
        revenue: { total: 0, growth: 0 },
        bookings: { total: 0, growth: 0 },
        clients: { total: 0, growth: 0 },
        avgBookingValue: 0
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Track your business performance</p>
          </div>
          
          {/* Period Selector */}
          <div className="bg-white rounded-lg border border-gray-200 p-1 flex gap-1">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  period === p
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                (data?.revenue.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(data?.revenue.growth || 0) >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                {Math.abs(data?.revenue.growth || 0)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(data?.revenue.total || 0)}
            </div>
            <div className="text-sm text-gray-600">Revenue</div>
          </div>

          {/* Bookings */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                (data?.bookings.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(data?.bookings.growth || 0) >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                {Math.abs(data?.bookings.growth || 0)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {data?.bookings.total || 0}
            </div>
            <div className="text-sm text-gray-600">Bookings</div>
          </div>

          {/* Clients */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                (data?.clients.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(data?.clients.growth || 0) >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                {Math.abs(data?.clients.growth || 0)}%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {data?.clients.total || 0}
            </div>
            <div className="text-sm text-gray-600">Clients</div>
          </div>

          {/* Avg Booking Value */}
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(data?.avgBookingValue || 0)}
            </div>
            <div className="text-sm text-gray-600">Avg Booking Value</div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Overview</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">Chart visualization</p>
              <p className="text-sm text-gray-500 mt-1">Coming soon</p>
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Services</h2>
          <div className="text-center py-8">
            <p className="text-gray-600">Service performance data will appear here</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
