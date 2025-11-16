'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Phone, Mail, Star, ChevronRight, ChevronDown, User, Check, X, Sparkles, Info } from 'lucide-react';
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
  staffIds?: string[];
  waiverRequired?: boolean;
  aftercareInstructions?: string;
  preparationInstructions?: string;
  gallery?: string[];
}

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
}

interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
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
  cancellationPolicy?: string;
  cancellationHours?: number;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  duration?: number;
}

interface Props {
  initialBusiness: Business;
  initialServices: Service[];
  initialBookingPage: BookingPageSettings;
  initialStaff: Staff[];
}

export default function BookingPageClient({
  initialBusiness,
  initialServices,
  initialBookingPage,
  initialStaff,
}: Props) {
  const router = useRouter();
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addons, setAddons] = useState<Record<string, Addon[]>>({});

  // Apply primary color
  useEffect(() => {
    if (initialBookingPage?.primaryColor) {
      document.documentElement.style.setProperty(
        '--primary-color',
        initialBookingPage.primaryColor
      );
    }
  }, [initialBookingPage]);

  // Load addons for a service
  const loadAddons = async (serviceId: string) => {
    if (addons[serviceId]) return; // Already loaded

    try {
      const response = await api.get(`/addons?serviceId=${serviceId}`);
      setAddons(prev => ({ ...prev, [serviceId]: response.data }));
    } catch (error) {
      console.error('Failed to load addons:', error);
    }
  };

  const handleServiceExpand = (serviceId: string) => {
    if (expandedService === serviceId) {
      setExpandedService(null);
    } else {
      setExpandedService(serviceId);
      loadAddons(serviceId);
    }
  };

  const handleBookService = (service: Service) => {
    router.push(`/business/${initialBusiness.slug}/book/${service.id}`);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const getQualifiedStaff = (service: Service) => {
    if (!service.staffIds || service.staffIds.length === 0) {
      return initialStaff;
    }
    return initialStaff.filter(staff => service.staffIds?.includes(staff.id));
  };

  const getRecommendedServices = (currentService: Service) => {
    return initialServices
      .filter(s => s.id !== currentService.id && s.category === currentService.category)
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-br text-white overflow-hidden"
        style={{
          backgroundColor: initialBookingPage.primaryColor || '#000000',
          backgroundImage: initialBookingPage.coverImage
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${initialBookingPage.coverImage})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
          <div className="max-w-3xl">
            {(initialBookingPage.logo || initialBusiness.logo) && (
              <img
                src={initialBookingPage.logo || initialBusiness.logo}
                alt={initialBusiness.name}
                className="h-16 w-auto mb-6 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2"
              />
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
              {initialBookingPage.heroTitle ||
                `Book an appointment with ${initialBusiness.name}`}
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {initialBookingPage.heroDescription ||
                initialBusiness.description ||
                'Experience premium beauty treatments'}
            </p>

            <div className="flex flex-wrap gap-4 text-sm">
              {initialBusiness.phone && (
                <a
                  href={`tel:${initialBusiness.phone}`}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>{initialBusiness.phone}</span>
                </a>
              )}
              {initialBusiness.email && (
                <a
                  href={`mailto:${initialBusiness.email}`}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition"
                >
                  <Mail className="w-4 h-4" />
                  <span>{initialBusiness.email}</span>
                </a>
              )}
              {initialBusiness.address && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {initialBusiness.address}, {initialBusiness.city}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      {initialBookingPage.welcomeMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 leading-relaxed">
                {initialBookingPage.welcomeMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Staff Section */}
      {initialStaff.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Meet Our Team</h2>
            <p className="text-gray-600">Experienced professionals ready to serve you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {initialStaff.slice(0, 4).map(staff => (
              <div
                key={staff.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {staff.avatar ? (
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-full h-full rounded-full object-cover border-4 border-gray-100"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                      {staff.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{staff.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{staff.role}</p>
                {staff.bio && (
                  <p className="text-xs text-gray-500 line-clamp-2">{staff.bio}</p>
                )}
                {staff.skills && staff.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    {staff.skills.slice(0, 2).map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Services</h2>
          <p className="text-gray-600">Choose a service to book your appointment</p>
        </div>

        {initialServices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Services Available
            </h3>
            <p className="text-gray-600">
              Please check back later or contact us directly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {initialServices.map(service => {
              const isExpanded = expandedService === service.id;
              const qualifiedStaff = getQualifiedStaff(service);
              const serviceAddons = addons[service.id] || [];
              const recommended = getRecommendedServices(service);

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
                >
                  {/* Service Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {service.name}
                          </h3>
                          {service.waiverRequired && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                              <Info className="w-3 h-3 mr-1" />
                              Waiver Required
                            </span>
                          )}
                        </div>

                        {service.description && (
                          <p className="text-gray-600 mb-4">{service.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {formatDuration(service.duration)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {qualifiedStaff.length} staff available
                            </span>
                          </div>
                          {service.category && (
                            <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                              {service.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-bold mb-2"
                          style={{ color: initialBookingPage.primaryColor || '#000' }}
                        >
                          {formatCurrency(service.price)}
                        </div>
                        <button
                          onClick={() => handleBookService(service)}
                          className="px-6 py-2.5 rounded-lg font-semibold text-white hover:opacity-90 transition shadow-sm"
                          style={{ backgroundColor: initialBookingPage.primaryColor || '#000' }}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => handleServiceExpand(service.id)}
                      className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                    >
                      <span>{isExpanded ? 'Hide' : 'Show'} details</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">
                      {/* Gallery */}
                      {service.gallery && service.gallery.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Gallery</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {service.gallery.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`${service.name} ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preparation Instructions */}
                      {service.preparationInstructions && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Preparation Instructions
                          </h4>
                          <p className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            {service.preparationInstructions}
                          </p>
                        </div>
                      )}

                      {/* Aftercare Instructions */}
                      {service.aftercareInstructions && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Aftercare Instructions
                          </h4>
                          <p className="text-sm text-gray-700 bg-green-50 border border-green-200 rounded-lg p-4">
                            {service.aftercareInstructions}
                          </p>
                        </div>
                      )}

                      {/* Add-ons */}
                      {serviceAddons.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">Add-ons</h4>
                          <div className="space-y-2">
                            {serviceAddons.map(addon => (
                              <label
                                key={addon.id}
                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition"
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={selectedAddons.includes(addon.id)}
                                    onChange={() => toggleAddon(addon.id)}
                                    className="w-4 h-4 rounded border-gray-300"
                                  />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {addon.name}
                                    </div>
                                    {addon.duration && (
                                      <div className="text-xs text-gray-500">
                                        +{formatDuration(addon.duration)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="font-bold text-gray-900">
                                  +{formatCurrency(addon.price)}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Qualified Staff */}
                      {qualifiedStaff.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">
                            Available Staff for This Service
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {qualifiedStaff.map(staff => (
                              <div
                                key={staff.id}
                                className="bg-white border border-gray-200 rounded-lg p-3 text-center"
                              >
                                <div className="w-12 h-12 mx-auto mb-2">
                                  {staff.avatar ? (
                                    <img
                                      src={staff.avatar}
                                      alt={staff.name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">
                                      {staff.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs font-medium text-gray-900">
                                  {staff.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Services */}
                      {recommended.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">
                            You might also like
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {recommended.map(rec => (
                              <div
                                key={rec.id}
                                onClick={() => handleServiceExpand(rec.id)}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 cursor-pointer transition"
                              >
                                <div className="font-semibold text-gray-900 mb-1">
                                  {rec.name}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">
                                    {formatDuration(rec.duration)}
                                  </span>
                                  <span className="font-bold text-gray-900">
                                    {formatCurrency(rec.price)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancellation Policy */}
      {initialBookingPage.cancellationPolicy && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-yellow-600" />
              Cancellation Policy
            </h3>
            <p className="text-sm text-gray-700">{initialBookingPage.cancellationPolicy}</p>
            {initialBookingPage.cancellationHours && (
              <p className="text-xs text-gray-600 mt-2">
                Cancellations must be made at least {initialBookingPage.cancellationHours}{' '}
                hours before your appointment.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© {new Date().getFullYear()} {initialBusiness.name}. All rights reserved.</p>
            <p className="mt-2">
              Powered by <span className="font-semibold">GlamBooking</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
