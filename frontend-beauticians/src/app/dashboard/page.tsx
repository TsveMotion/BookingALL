'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, TrendingUp, Clock, DollarSign, Star, Copy, ExternalLink, QrCode, Plus, Scissors, Heart, Send, Settings, ChevronRight, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import LineChart from '@/components/dashboard/charts/LineChart';
import AreaChart from '@/components/dashboard/charts/AreaChart';
import BarChart from '@/components/dashboard/charts/BarChart';
import DonutChart from '@/components/dashboard/charts/DonutChart';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Stats {
  totalBookings: number;
  totalClients: number;
  totalRevenue: number;
  pendingBookings: number;
  completedBookings: number;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  plan: string;
  email: string;
  phone: string;
}

interface AnalyticsData {
  revenue: { label: string; value: number }[];
  bookings: { label: string; value: number }[];
  clients: { label: string; value: number }[];
  services: { label: string; value: number; color: string }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingPageUrl, setBookingPageUrl] = useState<string>('');
  const [businessSlug, setBusinessSlug] = useState<string>('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [abandonedCount, setAbandonedCount] = useState<number>(0);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: [],
    bookings: [],
    clients: [],
    services: [],
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      router.replace('/login');
      return;
    }

    void loadDashboardData();
  }, [authLoading, user]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      console.log('Loading dashboard data...');
      const [statsResponse, businessResponse, analyticsResponse] = await Promise.all([
        api.get('/business/stats'),
        api.get('/business'),
        api.get('/analytics/overview').catch(() => null),
      ]);

      console.log('Stats:', statsResponse.data);
      console.log('Business:', businessResponse.data);

      setStats(statsResponse.data);
      setBusiness(businessResponse.data);

      // Process analytics data or use defaults
      if (analyticsResponse?.data) {
        setAnalyticsData(analyticsResponse.data);
      } else {
        // Use real stats to show zeros if no analytics available
        const defaultRevenue = Array(7).fill(0).map((_, i) => ({
          label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          value: 0
        }));
        const defaultBookings = Array(7).fill(0).map((_, i) => ({
          label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          value: 0
        }));
        const defaultClients = Array(6).fill(0).map((_, i) => ({
          label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i],
          value: 0
        }));
        setAnalyticsData({
          revenue: defaultRevenue,
          bookings: defaultBookings,
          clients: defaultClients,
          services: [],
        });
      }

      const businessData = businessResponse.data;
      if (businessData?.slug) {
        setBusinessSlug(businessData.slug);
        const baseUrl = process.env.NEXT_PUBLIC_BOOKING_URL || 'http://localhost:3002';
        setBookingPageUrl(`${baseUrl}/business/${businessData.slug}`);
      }

      // Load abandoned bookings count if premium
      if (businessData?.plan === 'PRO' || businessData?.plan === 'BUSINESS') {
        try {
          const abandonedResponse = await api.get('/bookings', {
            params: {
              status: 'PENDING',
              paymentStatus: 'PENDING',
              limit: 100,
            },
          });
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
          const abandoned = abandonedResponse.data.bookings.filter((b: any) => 
            new Date(b.createdAt) < tenMinutesAgo
          );
          setAbandonedCount(abandoned.length);
        } catch (err) {
          console.error('Failed to load abandoned bookings:', err);
        }
      }
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        router.replace('/login');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Please check your permissions.');
      } else {
        toast.error(error.response?.data?.error || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }

  const copyBookingLink = () => {
    if (bookingPageUrl) {
      navigator.clipboard.writeText(bookingPageUrl);
      toast.success('Booking link copied to clipboard!');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header - Fresha Style */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Good day, {user?.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Here's what's happening with your business today</p>
          </div>
          <Link href="/dashboard/bookings">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Booking</span>
              <span className="sm:hidden">New</span>
            </button>
          </Link>
        </div>

        {/* Booking Page Link Card - Full Width Priority Card */}
        {bookingPageUrl && (
          <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Your Booking Page</h3>
                  <p className="text-sm text-gray-600">Share this link with your clients to accept online bookings</p>
                </div>
              </div>
              <Link href="/dashboard/booking-page">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition text-sm">
                  <Settings className="w-4 h-4" />
                  Edit Page
                </button>
              </Link>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 mb-1 font-semibold uppercase tracking-wide">Public Booking Link</p>
                  <p className="text-sm font-mono text-gray-900 truncate font-medium">{bookingPageUrl}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={copyBookingLink}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition text-sm whitespace-nowrap"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                  <a
                    href={bookingPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition text-sm shadow-md hover:shadow-lg"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Abandoned Bookings Premium Card */}
        {business && (business.plan === 'PRO' || business.plan === 'BUSINESS') && abandonedCount > 0 && (
          <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    Abandoned Bookings
                    <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full font-semibold">PREMIUM</span>
                  </h3>
                  <p className="text-sm text-gray-600">Recover lost revenue from incomplete bookings</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-300 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-black">{abandonedCount}</p>
                  <p className="text-sm text-white">Pending bookings not completed</p>
                </div>
                <Link href="/dashboard/bookings?filter=abandoned">
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition text-sm">
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-black" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : '£0'}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>

          {/* Bookings Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.totalBookings || 0}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>

          {/* Clients Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.totalClients || 0}
            </div>
            <div className="text-sm text-gray-600">Total Clients</div>
          </div>

          {/* Pending Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-black" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.pendingBookings || 0}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        {/* Analytics Graphs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Over Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Revenue Over Time</h3>
                <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-black" />
              </div>
            </div>
            <LineChart
              data={analyticsData.revenue}
              color="#000000"
              height={220}
            />
          </div>

          {/* Bookings Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Bookings Trend</h3>
                <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <AreaChart
              data={analyticsData.bookings}
              color="#404040"
              height={220}
            />
          </div>

          {/* Client Growth */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">New Clients</h3>
                <p className="text-sm text-gray-500 mt-1">Monthly growth</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <BarChart
              data={analyticsData.clients}
              color="#000000"
              height={220}
            />
          </div>

          {/* Services Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Popular Services</h3>
                <p className="text-sm text-gray-500 mt-1">Bookings by service type</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-black" />
              </div>
            </div>
            {analyticsData.services && analyticsData.services.length > 0 ? (
              <DonutChart
                data={analyticsData.services}
                size={240}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No service data available yet</p>
              </div>
            )}
          </div>
        </div>


        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/clients">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Clients</h3>
              <p className="text-sm text-gray-600">Manage your client database</p>
            </div>
          </Link>

          <Link href="/dashboard/services">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-black" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Services</h3>
              <p className="text-sm text-gray-600">Add and edit your offerings</p>
            </div>
          </Link>

          <Link href="/dashboard/analytics">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-black" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Analytics</h3>
              <p className="text-sm text-gray-600">Track your performance</p>
            </div>
          </Link>
        </div>
    </div>
  );
}
