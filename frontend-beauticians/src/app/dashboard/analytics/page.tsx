'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Calendar, DollarSign, Users, Clock, ArrowUp, ArrowDown, Crown, Target, Repeat, Star, Zap, TrendingDown } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
  };
  bookings: {
    total: number;
    growth: number;
    completed: number;
    cancelled: number;
  };
  clients: {
    total: number;
    growth: number;
    new: number;
    returning: number;
  };
  avgBookingValue: number;
  topServices?: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
  revenueByService?: Array<{
    service: string;
    amount: number;
    percentage: number;
  }>;
  clientRetention?: {
    rate: number;
    returning: number;
    oneTime: number;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  const userPlan = (user as any)?.business?.plan || 'FREE';
  const hasAdvancedAnalytics = ['STARTER', 'PRO', 'BUSINESS'].includes(userPlan);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    loadAnalytics();
  }, [period, authLoading, user]);

  async function loadAnalytics() {
    try {
      const response = await api.get('/analytics', { params: { period } });
      setData(response.data);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      if (error.response?.status === 401) {
        router.replace('/login');
      } else {
        // Initialize with zeros if API fails
        setData({
          revenue: { total: 0, growth: 0 },
          bookings: { total: 0, growth: 0, completed: 0, cancelled: 0 },
          clients: { total: 0, growth: 0, new: 0, returning: 0 },
          avgBookingValue: 0
        });
      }
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-black animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics</h1>
              {hasAdvancedAnalytics && (
                <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full">ADVANCED</span>
              )}
            </div>
            <p className="text-sm text-gray-600">Track your business performance and insights</p>
          </div>
          
          {/* Period Selector */}
          <div className="bg-white rounded-lg border border-gray-300 p-1 flex gap-1 shadow-sm">
            {(['week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                  period === p
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Upgrade Banner for Free Plan */}
        {!hasAdvancedAnalytics && (
          <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Unlock Advanced Analytics</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Get detailed insights on revenue breakdown, client retention, top services, and more with Starter plan or higher.
                </p>
                <a
                  href="/dashboard/billing"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade Now
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="bg-white rounded-xl border border-gray-300 p-5 hover:shadow-md transition-all">
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
          <div className="bg-white rounded-xl border border-gray-300 p-5 hover:shadow-md transition-all">
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
          <div className="bg-white rounded-xl border border-gray-300 p-5 hover:shadow-md transition-all">
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
          <div className="bg-white rounded-xl border border-gray-300 p-5 hover:shadow-md transition-all">
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

        {/* Advanced Analytics - Only for Starter+ */}
        {hasAdvancedAnalytics && data?.topServices && data.topServices.length > 0 && (
          <>
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-xl border border-gray-300 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Revenue Breakdown
                </h2>
              </div>
              <div className="space-y-3">
                {data?.revenueByService?.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.service}</span>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(item.amount)}</div>
                        <div className="text-xs text-gray-500">{item.percentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Retention */}
            <div className="bg-white rounded-xl border border-gray-300 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Repeat className="w-5 h-5" />
                  Client Retention
                </h2>
              </div>
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">{data?.clientRetention?.rate}%</div>
                <p className="text-sm text-gray-600">Overall retention rate</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700 mb-1">{data?.clientRetention?.returning}</div>
                  <div className="text-xs text-green-600 font-medium">Returning Clients</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-700 mb-1">{data?.clientRetention?.oneTime}</div>
                  <div className="text-xs text-gray-600 font-medium">One-Time Clients</div>
                </div>
              </div>
            </div>

            {/* Top Services */}
            <div className="bg-white rounded-xl border border-gray-300 p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Top Performing Services
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Bookings</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Avg Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data?.topServices?.map((service, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{service.bookings}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(service.revenue)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(service.revenue / service.bookings)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Booking Status Breakdown */}
            <div className="bg-white rounded-xl border border-gray-300 p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Booking Performance
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-5 text-center">
                  <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{data?.bookings.total || 0}</div>
                  <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">Total Bookings</div>
                </div>
                <div className="bg-green-50 rounded-lg p-5 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700 mb-1">{data?.bookings.completed || 0}</div>
                  <div className="text-xs text-green-600 font-medium uppercase tracking-wide">Completed</div>
                </div>
                <div className="bg-red-50 rounded-lg p-5 text-center">
                  <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700 mb-1">{data?.bookings.cancelled || 0}</div>
                  <div className="text-xs text-red-600 font-medium uppercase tracking-wide">Cancelled</div>
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
