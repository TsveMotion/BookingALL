'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, User, Filter, Plus, X, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  notes?: string;
  aftercareSent: boolean;
  waiverRequired: boolean;
  waiverSigned: boolean;
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  location?: {
    name: string;
  };
  addons?: Array<{
    id: string;
    addon: {
      name: string;
    };
    priceAdjustment: number;
  }>;
}

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    loadBookings();
  }, [authLoading, user]);

  async function loadBookings() {
    setLoading(true);
    try {
      const response = await api.get('/bookings', { 
        params: { limit: 100, offset: 0 } 
      });
      setBookings(response.data.bookings || []);
    } catch (error: any) {
      console.error('Failed to load bookings:', error);
      if (error.response?.status === 401) {
        router.replace('/login');
      } else {
        toast.error('Failed to load bookings');
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId: string, newStatus: string) {
    try {
      await api.patch(`/bookings/${bookingId}`, { status: newStatus });
      toast.success('Booking status updated');
      loadBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking');
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch = 
      booking.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: bookings.length,
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
    COMPLETED: bookings.filter((b) => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} • Manage appointments and schedules
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/bookings/new')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Booking</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table - Desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-300">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Client</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Service</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Date & Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Payment</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No bookings found</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowModal(true);
                  }}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-sm">
                        {booking.client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{booking.client.name}</p>
                        <p className="text-sm text-gray-500">{booking.client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{booking.service.name}</p>
                    <p className="text-sm text-gray-500">{booking.service.duration} minutes</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 font-medium">
                        {new Date(booking.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      booking.paymentStatus === 'PAID' ? 'bg-black text-white' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.paymentStatus.charAt(0) + booking.paymentStatus.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    £{booking.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bookings Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-300 p-12 text-center shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No bookings found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => {
                setSelectedBooking(booking);
                setShowModal(true);
              }}
              className="bg-white rounded-xl border border-gray-300 p-4 active:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-sm">
                    {booking.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{booking.client.name}</p>
                    <p className="text-sm text-gray-500">{booking.service.name}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(booking.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <p className="font-bold text-gray-900">£{booking.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Client</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {selectedBooking.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedBooking.client.name}</p>
                    <p className="text-sm text-gray-600">{selectedBooking.client.email}</p>
                    {selectedBooking.client.phone && (
                      <p className="text-sm text-gray-600">{selectedBooking.client.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Service</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="font-semibold text-gray-900">{selectedBooking.service.name}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{selectedBooking.service.duration} min</span>
                    <span>•</span>
                    <span className="font-semibold">£{selectedBooking.service.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Add-ons */}
              {selectedBooking.addons && selectedBooking.addons.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Add-ons</h3>
                  <div className="space-y-2">
                    {selectedBooking.addons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <span className="text-sm text-gray-900">{addon.addon.name}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {addon.priceAdjustment >= 0 ? '+' : ''}£{addon.priceAdjustment.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Date & Time</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>{new Date(selectedBooking.startTime).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span>{new Date(selectedBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              {/* Status & Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Status</h3>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${
                    selectedBooking.status === 'COMPLETED' ? 'bg-white text-black border-black' :
                    selectedBooking.status === 'CONFIRMED' ? 'bg-gray-100 text-gray-900 border-gray-300' :
                    'bg-white text-gray-700 border-gray-400'
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Payment</h3>
                  <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium border ${
                    selectedBooking.paymentStatus === 'PAID' ? 'bg-black text-white border-black' :
                    'bg-white text-gray-700 border-gray-400'
                  }`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Aftercare & Waiver */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {selectedBooking.aftercareSent ? (
                    <CheckCircle className="w-5 h-5 text-black" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">
                    Aftercare {selectedBooking.aftercareSent ? 'Sent' : 'Not Sent'}
                  </span>
                </div>
                {selectedBooking.waiverRequired && (
                  <div className="flex items-center gap-2">
                    {selectedBooking.waiverSigned ? (
                      <CheckCircle className="w-5 h-5 text-black" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700">
                      Waiver {selectedBooking.waiverSigned ? 'Signed' : 'Pending'}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-black">£{selectedBooking.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              {selectedBooking.status !== 'COMPLETED' && selectedBooking.status !== 'CANCELLED' && (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Update Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedBooking.status === 'PENDING' && (
                      <button
                        onClick={() => updateBookingStatus(selectedBooking.id, 'CONFIRMED')}
                        className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Confirm
                      </button>
                    )}
                    {selectedBooking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => updateBookingStatus(selectedBooking.id, 'COMPLETED')}
                        className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'CANCELLED')}
                      className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
