'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, Clock, MapPin, Phone, Mail, Star, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDuration } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
}

interface BookingPageSettings {
  enabled: boolean;
  primaryColor: string;
  logo?: string;
  coverImage?: string;
  heroTitle?: string;
  heroDescription?: string;
  welcomeMessage?: string;
}

export default function BusinessBookingPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookingPage, setBookingPage] = useState<BookingPageSettings | null>(null);

  useEffect(() => {
    if (slug) {
      loadBookingPage();
    }
  }, [slug]);

  async function loadBookingPage() {
    try {
      const response = await api.get(`/booking-page/public/${slug}`);
      setBusiness(response.data.business);
      setServices(response.data.services);
      setBookingPage(response.data.bookingPage);

      // Set custom primary color
      if (response.data.bookingPage?.primaryColor) {
        document.documentElement.style.setProperty(
          '--primary-color',
          response.data.bookingPage.primaryColor
        );
      }
    } catch (error: any) {
      console.error('Failed to load booking page:', error);
      if (error.response?.status === 404) {
        toast.error('Business not found');
      } else if (error.response?.status === 403) {
        toast.error('Booking page is not available');
      } else {
        toast.error('Failed to load booking page');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    router.push(`/business/${slug}/services/${serviceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-primary animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!business || !bookingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600">The booking page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-br from-primary/90 to-purple-700 text-white"
        style={{
          backgroundImage: bookingPage.coverImage ? `url(${bookingPage.coverImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {bookingPage.coverImage && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-purple-700/90"></div>
        )}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            {(bookingPage.logo || business.logo) && (
              <img
                src={bookingPage.logo || business.logo}
                alt={business.name}
                className="h-16 w-auto mb-6"
              />
            )}
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {bookingPage.heroTitle || `Book an appointment with ${business.name}`}
            </h1>
            
            <p className="text-xl text-white/90 mb-8">
              {bookingPage.heroDescription || business.description || 'Experience premium beauty treatments'}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              {business.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{business.phone}</span>
                </div>
              )}
              {business.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{business.email}</span>
                </div>
              )}
              {business.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{business.address}, {business.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      {bookingPage.welcomeMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-gray-700 leading-relaxed">{bookingPage.welcomeMessage}</p>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Services</h2>
          <p className="text-gray-600">Choose a service to book your appointment</p>
        </div>

        {services.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Services Available</h3>
            <p className="text-gray-600">Please check back later or contact us directly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition">
                    {service.name}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition" />
                </div>

                {service.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(service.duration)}</span>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(service.price)}
                  </div>
                </div>

                {service.category && (
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {service.category}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
            <p className="mt-2">Powered by GlamBooking</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
