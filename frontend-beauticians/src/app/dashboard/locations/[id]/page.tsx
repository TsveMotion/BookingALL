'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, Clock, Globe, ExternalLink, Calendar, DollarSign, TrendingUp, Users, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Location {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
  openingHours?: any;
  parkingInfo?: string;
  accessibilityInfo?: string;
  socialLinks?: any;
  googleMapsUrl?: string;
  websiteUrl?: string;
  isPrimary: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  analytics?: {
    totalBookings: number;
    completedBookings: number;
    totalRevenue: number;
    recentBookings: any[];
  };
  services?: any[];
  _count?: {
    bookings: number;
    services: number;
  };
}

export default function LocationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    loadLocation();
  }, [authLoading, user, params.id]);

  async function loadLocation() {
    setLoading(true);
    try {
      const response = await api.get(`/locations/${params.id}`);
      setLocation(response.data);
    } catch (error: any) {
      console.error('Failed to load location:', error);
      if (error.response?.status === 401) {
        router.replace('/login');
      } else if (error.response?.status === 404) {
        toast.error('Location not found');
        router.push('/dashboard/locations');
      } else {
        toast.error('Failed to load location details');
      }
    } finally {
      setLoading(false);
    }
  }

  const formatHours = (hours: any) => {
    if (!hours) return null;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map(day => {
      const dayHours = hours[day];
      if (!dayHours) return null;
      return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        ...dayHours
      };
    }).filter(Boolean);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-black animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading location...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Location not found</p>
        </div>
      </div>
    );
  }

  const hoursArray = formatHours(location.openingHours);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/dashboard/locations')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{location.name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {location.isPrimary && 'Primary Location • '}
            {location.active ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      {location.analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-300 p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{location.analytics.totalBookings}</p>
            <p className="text-sm text-gray-600 mt-1">Total Bookings</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-300 p-5">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{location.analytics.completedBookings}</p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-300 p-5">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">£{location.analytics.totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-300 p-5">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{location._count?.services || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Services Offered</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-300 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              {location.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">{location.address}</p>
                    {(location.city || location.postcode) && (
                      <p className="text-gray-600 text-sm">
                        {[location.city, location.postcode, location.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {location.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <a href={`tel:${location.phone}`} className="text-gray-900 hover:text-black">
                    {location.phone}
                  </a>
                </div>
              )}

              {location.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${location.email}`} className="text-gray-900 hover:text-black">
                    {location.email}
                  </a>
                </div>
              )}

              {location.websiteUrl && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <a
                    href={location.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-black flex items-center gap-1"
                  >
                    {location.websiteUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {location.googleMapsUrl && (
              <a
                href={location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <MapPin className="w-4 h-4" />
                View on Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Description */}
          {location.description && (
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{location.description}</p>
            </div>
          )}

          {/* Additional Info */}
          {(location.parkingInfo || location.accessibilityInfo) && (
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h2>
              <div className="space-y-4">
                {location.parkingInfo && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Parking</h3>
                    <p className="text-gray-700 text-sm">{location.parkingInfo}</p>
                  </div>
                )}
                {location.accessibilityInfo && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Accessibility</h3>
                    <p className="text-gray-700 text-sm">{location.accessibilityInfo}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Bookings */}
          {location.analytics?.recentBookings && location.analytics.recentBookings.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h2>
              <div className="space-y-2">
                {location.analytics.recentBookings.slice(0, 5).map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{booking.client?.name}</p>
                      <p className="text-xs text-gray-600">{booking.service?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(booking.startTime).toLocaleDateString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Opening Hours */}
          {hoursArray && hoursArray.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">Opening Hours</h2>
              </div>
              <div className="space-y-2">
                {hoursArray.map((day: any) => (
                  <div key={day.day} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">{day.day}</span>
                    {day.closed ? (
                      <span className="text-gray-400 italic">Closed</span>
                    ) : (
                      <span className="text-gray-900">{day.open} - {day.close}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {location.socialLinks && Object.keys(location.socialLinks).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Social Media</h2>
              <div className="space-y-2">
                {Object.entries(location.socialLinks).map(([platform, url]: [string, any]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-gray-900 capitalize">{platform}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Services at this location */}
          {location.services && location.services.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-300 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Services Available</h2>
              <div className="space-y-2">
                {location.services.map((serviceLocation: any) => (
                  <div
                    key={serviceLocation.id}
                    className="p-2 rounded-lg border border-gray-200 text-sm text-gray-900"
                  >
                    {serviceLocation.service?.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
