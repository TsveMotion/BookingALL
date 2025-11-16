'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Edit, Trash2, Phone, Mail, Building, X, Star, Clock, Crown, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
  active: boolean;
  openingHours?: string;
  workingHours?: any;
  createdAt: string;
  updatedAt: string;
}

interface Business {
  id: string;
  name: string;
  category: string;
  plan: string;
  address?: string;
  city?: string;
  postcode?: string;
  phone?: string;
  email?: string;
}

export default function LocationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    phone: '',
    email: '',
    openingHours: '',
    isPrimary: false,
    active: true,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    loadData();
  }, [authLoading, user]);

  async function loadData() {
    setLoading(true);
    try {
      const [locationsRes, businessRes] = await Promise.all([
        api.get('/locations'),
        api.get('/business/me').catch(() => ({ data: null })),
      ]);
      setLocations(locationsRes.data || []);
      setBusiness(businessRes.data);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      if (error.response?.status === 401) {
        router.replace('/login');
      } else {
        toast.error('Failed to load locations');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Check plan limits before creating
    if (!selectedLocation && business) {
      const plan = business.plan;
      const canAddMore = checkCanAddLocation(plan, locations.length);
      
      if (!canAddMore) {
        setShowModal(false);
        setShowUpgradeModal(true);
        return;
      }
    }

    setLoading(true);
    try {
      if (selectedLocation) {
        await api.patch(`/locations/${selectedLocation.id}`, formData);
        toast.success('Location updated successfully');
      } else {
        await api.post('/locations', formData);
        toast.success('Location created successfully');
      }
      await loadData();
      setShowModal(false);
      setSelectedLocation(null);
      resetForm();
    } catch (error: any) {
      console.error('Failed to save location:', error);
      if (error.response?.status === 403) {
        // Plan limit reached
        setShowModal(false);
        setShowUpgradeModal(true);
        toast.error(error.response?.data?.message || 'Upgrade required to add more locations');
      } else {
        toast.error(error.response?.data?.error || 'Failed to save location');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(locationId: string) {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await api.delete(`/locations/${locationId}`);
      toast.success('Location deleted');
      loadData();
    } catch (error) {
      console.error('Failed to delete location:', error);
      toast.error('Failed to delete location');
    }
  }

  function checkCanAddLocation(plan: string, currentCount: number): boolean {
    if (plan === 'FREE' || plan === 'STARTER') {
      return currentCount < 1;
    }
    // PRO and BUSINESS have unlimited
    return true;
  }

  function openModal(location?: Location) {
    // Check if user can add more locations
    if (!location && business) {
      const canAdd = checkCanAddLocation(business.plan, locations.length);
      if (!canAdd) {
        setShowUpgradeModal(true);
        return;
      }
    }

    if (location) {
      setSelectedLocation(location);
      setFormData({
        name: location.name,
        address: location.address || '',
        city: location.city || '',
        postcode: location.postcode || '',
        country: location.country || 'United Kingdom',
        phone: location.phone || '',
        email: location.email || '',
        openingHours: location.openingHours || '',
        isPrimary: location.isPrimary,
        active: location.active ?? true,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      address: '',
      city: '',
      postcode: '',
      country: 'United Kingdom',
      phone: '',
      email: '',
      openingHours: '',
      isPrimary: false,
      active: true,
    });
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-black animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-sm text-gray-600 mt-1">
            {locations.length} location{locations.length !== 1 ? 's' : ''} • {business?.plan === 'FREE' || business?.plan === 'STARTER' ? 'Starter plan: 1 location max' : 'Unlimited locations'}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Location</span>
        </button>
      </div>

      {/* Business Info Card from Onboarding */}
      {business && (
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-xl p-6 border border-gray-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building className="w-5 h-5" />
                <h2 className="text-xl font-bold">{business.name}</h2>
              </div>
              <p className="text-sm text-gray-400 capitalize">{business.category || 'Beauty Business'}</p>
            </div>
            <span className="px-3 py-1 bg-white text-black text-xs font-bold rounded-full">
              PRIMARY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {business.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-white">{business.address}</p>
                  {(business.city || business.postcode) && (
                    <p className="text-gray-400">
                      {[business.city, business.postcode].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {business.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-white">{business.phone}</span>
              </div>
            )}

            {business.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-white">{business.email}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-400">
              This information was collected during onboarding. Add more locations below.
            </p>
          </div>
        </div>
      )}

      {/* Additional Locations */}
      {locations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-300 p-12 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="font-bold text-gray-900 text-lg mb-2">No additional locations</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
            Add more locations to manage multiple business sites and expand your operations
          </p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add First Location
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {locations.map((location) => (
            <div
              key={location.id}
              className="bg-white rounded-xl border border-gray-300 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">{location.name}</h3>
                    {location.isPrimary && (
                      <Star className="w-4 h-4 fill-black text-black" />
                    )}
                  </div>
                  {!location.active && (
                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(location)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {location.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900">{location.address}</p>
                      {(location.city || location.postcode) && (
                        <p className="text-gray-500">
                          {[location.city, location.postcode, location.country].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {location.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{location.phone}</span>
                  </div>
                )}

                {location.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{location.email}</span>
                  </div>
                )}

                {location.openingHours && (
                  <div className="flex items-start gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-700">{location.openingHours}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Added {new Date(location.createdAt).toLocaleDateString()}
                  </span>
                  {location.active ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Inactive</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Upgrade Required</h2>
              <p className="text-gray-600 mb-6">
                Your current plan allows only <strong>1 location</strong>. Upgrade to Pro or Business plan for unlimited locations.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Current Plan</p>
                    <p className="text-lg font-bold text-gray-900">{business?.plan || 'Starter'}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Location Limit</p>
                    <p className="text-lg font-bold text-gray-900">1 Location</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <a
                  href="/dashboard/billing"
                  className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedLocation ? 'Edit Location' : 'New Location'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedLocation(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Downtown Salon"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 High Street"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="London"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={formData.postcode}
                      onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                      placeholder="SW1A 1AA"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+44 20 1234 5678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="location@business.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Hours
                  </label>
                  <textarea
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    rows={3}
                    placeholder="Mon-Fri: 9am-6pm&#10;Sat: 10am-4pm&#10;Sun: Closed"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Set as primary location</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedLocation(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : selectedLocation ? 'Update Location' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
