'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Clock, DollarSign, Package, FileText, FileSignature, ToggleLeft, ToggleRight, Edit, Trash2, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import ServiceModal from '@/components/modals/ServiceModal';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  addons?: Array<{
    id: string;
    name: string;
  }>;
  aftercareTemplate?: {
    id: string;
    title: string;
  } | null;
  waiverTemplate?: {
    id: string;
    title: string;
  } | null;
  _count?: {
    bookings: number;
  };
}

interface ServiceAddon {
  id: string;
  name: string;
  description: string | null;
  priceAdjustment: number;
  durationAdjustment: number;
  required: boolean;
  active: boolean;
  service: {
    name: string;
  };
}

type Tab = 'all' | 'active' | 'inactive' | 'addons' | 'aftercare' | 'waivers';

export default function ServicesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [services, setServices] = useState<Service[]>([]);
  const [addons, setAddons] = useState<ServiceAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

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
      const [servicesRes, addonsRes] = await Promise.all([
        api.get('/services'),
        api.get('/addons').catch(() => ({ data: [] })),
      ]);
      setServices(servicesRes.data || []);
      setAddons(addonsRes.data || []);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      if (error.response?.status === 401) {
        router.replace('/login');
      } else {
        toast.error('Failed to load services');
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleServiceActive(serviceId: string, currentActive: boolean) {
    try {
      await api.patch(`/services/${serviceId}`, { active: !currentActive });
      toast.success(`Service ${!currentActive ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (error) {
      console.error('Failed to toggle service:', error);
      toast.error('Failed to update service');
    }
  }

  async function deleteService(serviceId: string) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      await api.delete(`/services/${serviceId}`);
      toast.success('Service deleted');
      loadData();
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast.error('Failed to delete service');
    }
  }

  const filteredServices = services.filter((service) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return service.active;
    if (activeTab === 'inactive') return !service.active;
    return true;
  });

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'all', label: 'All Services', count: services.length },
    { id: 'active', label: 'Active', count: services.filter(s => s.active).length },
    { id: 'inactive', label: 'Inactive', count: services.filter(s => !s.active).length },
    { id: 'addons', label: 'Add-ons', count: addons.length },
    { id: 'aftercare', label: 'Aftercare' },
    { id: 'waivers', label: 'Waivers' },
  ];

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your services, add-ons, aftercare, and waivers</p>
        </div>
        <button
          onClick={() => {
            setSelectedService(null);
            setShowServiceModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Service</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-300 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 opacity-75">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {(activeTab === 'all' || activeTab === 'active' || activeTab === 'inactive') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-gray-300 p-12 text-center">
              <p className="text-gray-500">No services found</p>
              <button
                onClick={() => setShowServiceModal(true)}
                className="mt-4 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Create Your First Service
              </button>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl border border-gray-300 p-5 hover:shadow-sm transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleServiceActive(service.id, service.active)}
                    className={`ml-3 p-1.5 rounded-lg transition-colors ${
                      service.active ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                    title={service.active ? 'Active' : 'Inactive'}
                  >
                    {service.active ? (
                      <ToggleRight className="w-5 h-5" />
                    ) : (
                      <ToggleLeft className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Pricing & Duration */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold">£{service.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {service.addons && service.addons.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span>{service.addons.length} add-on{service.addons.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {service.aftercareTemplate && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>Aftercare attached</span>
                    </div>
                  )}
                  {service.waiverTemplate && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FileSignature className="w-4 h-4 text-gray-400" />
                      <span>Waiver required</span>
                    </div>
                  )}
                  {service._count && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{service._count.bookings} booking{service._count.bookings !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedService(service);
                      setShowServiceModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Last Updated */}
                <p className="text-xs text-gray-400 mt-3">
                  Updated {new Date(service.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add-ons Tab */}
      {activeTab === 'addons' && (
        <div className="bg-white rounded-xl border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add-ons Manager</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              New Add-on
            </button>
          </div>
          
          {addons.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium mb-1">No add-ons yet</p>
              <p className="text-sm">Create add-ons to enhance your services</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{addon.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                        {addon.service.name}
                      </span>
                    </div>
                    {addon.description && (
                      <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-700">
                      <span>
                        {addon.priceAdjustment >= 0 ? '+' : ''}£{addon.priceAdjustment.toFixed(2)}
                      </span>
                      {addon.durationAdjustment !== 0 && (
                        <span>
                          {addon.durationAdjustment >= 0 ? '+' : ''}{addon.durationAdjustment} min
                        </span>
                      )}
                      {addon.required && (
                        <span className="text-xs px-2 py-0.5 bg-black text-white rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aftercare Tab */}
      {activeTab === 'aftercare' && (
        <div className="bg-white rounded-xl border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Aftercare Templates</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              New Template
            </button>
          </div>
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium mb-1">No aftercare templates</p>
            <p className="text-sm">Create templates to send post-appointment care instructions</p>
          </div>
        </div>
      )}

      {/* Waivers Tab */}
      {activeTab === 'waivers' && (
        <div className="bg-white rounded-xl border border-gray-300 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Waiver Templates</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4" />
              New Waiver
            </button>
          </div>
          <div className="text-center py-12 text-gray-500">
            <FileSignature className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium mb-1">No waiver templates</p>
            <p className="text-sm">Create waivers for clients to sign before appointments</p>
          </div>
        </div>
      )}

      {/* Service Modal */}
      <ServiceModal
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setSelectedService(null);
        }}
        service={selectedService}
        onSuccess={loadData}
      />
    </div>
  );
}
