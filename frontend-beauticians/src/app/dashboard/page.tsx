'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, TrendingUp, Clock, DollarSign, Star, ChevronRight, Plus, Link as LinkIcon, Copy, ExternalLink, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingPageUrl, setBookingPageUrl] = useState<string>('');
  const [businessSlug, setBusinessSlug] = useState<string>('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [abandonedCount, setAbandonedCount] = useState<number>(0);

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
      const [statsResponse, businessResponse] = await Promise.all([
        api.get('/business/stats'),
        api.get('/business'),
      ]);

      console.log('Stats:', statsResponse.data);
      console.log('Business:', businessResponse.data);

      setStats(statsResponse.data);
      setBusiness(businessResponse.data);

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
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
            <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
          <div className="bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <LinkIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Your Booking Page</h3>
                  <p className="text-sm text-gray-600">Share this link with your clients to accept online bookings</p>
                </div>
              </div>
              <Link href="/dashboard/booking-page">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-300 rounded-lg font-medium hover:bg-gray-50 hover:border-purple-400 transition text-sm shadow-sm">
                  <Settings className="w-4 h-4" />
                  Edit Page
                </button>
              </Link>
            </div>
            
            <div className="bg-white rounded-lg border-2 border-purple-200 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-purple-700 mb-1 font-semibold uppercase tracking-wide">Public Booking Link</p>
                  <p className="text-sm font-mono text-gray-900 truncate font-medium">{bookingPageUrl}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={copyBookingLink}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition text-sm whitespace-nowrap shadow-md hover:shadow-lg"
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
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-xl border-2 border-amber-300 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    Abandoned Bookings
                    <span className="px-2 py-0.5 bg-amber-600 text-white text-xs rounded-full font-semibold">PREMIUM</span>
                  </h3>
                  <p className="text-sm text-gray-600">Recover lost revenue from incomplete bookings</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border-2 border-amber-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-amber-600">{abandonedCount}</p>
                  <p className="text-sm text-gray-600">Pending bookings not completed</p>
                </div>
                <Link href="/dashboard/bookings?filter=abandoned">
                  <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition text-sm shadow-md hover:shadow-lg">
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
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
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
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats?.pendingBookings || 0}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/clients">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
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
                <div className="w-11 h-11 bg-pink-50 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-pink-600" />
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
                <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Analytics</h3>
              <p className="text-sm text-gray-600">Track your performance</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
