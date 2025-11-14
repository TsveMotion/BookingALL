'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Plus, Clock, DollarSign, Tag } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/Button';
import ServiceModal from '@/components/modals/ServiceModal';
import api from '@/lib/api';
import { formatCurrency, formatDuration } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: string | null;
  active: boolean;
  _count?: {
    bookings: number;
  };
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);

  useEffect(() => {
    loadServices();
  }, [filter]);

  async function loadServices() {
    try {
      const params: any = {};
      if (filter !== 'all') {
        params.active = filter === 'active';
      }

      const response = await api.get('/services', { params });
      setServices(response.data || []);
    } catch (error: any) {
      console.error('Failed to load services:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        toast.error('Failed to load services');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const activeServices = services.filter(s => s.active);
  const inactiveServices = services.filter(s => !s.active);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your beauty treatments</p>
          </div>
          <button 
            onClick={() => {
              setSelectedService(undefined);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{services.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Services</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{activeServices.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div>
              <p className="text-sm text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {services.length > 0
                  ? formatCurrency(services.reduce((sum, s) => sum + s.price, 0) / services.length)
                  : '£0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-900 font-medium">No services found</p>
              <p className="text-sm text-gray-600 mt-1">Add your first service to get started</p>
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setModalOpen(true);
                }}
                className={`bg-white rounded-lg p-5 border transition cursor-pointer hover:shadow-sm ${
                  service.active ? 'border-gray-200' : 'border-gray-300 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
                  {!service.active && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                {service.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {formatDuration(service.duration)}
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    {formatCurrency(service.price)}
                  </div>

                  {service.category && (
                    <div className="flex items-center text-sm text-gray-700">
                      <Tag className="w-4 h-4 mr-2 text-gray-400" />
                      {service.category}
                    </div>
                  )}
                </div>

                {service._count && service._count.bookings > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      {service._count.bookings} booking{service._count.bookings !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Service Modal */}
        <ServiceModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedService(undefined);
          }}
          onSuccess={() => loadServices()}
          service={selectedService}
        />
      </div>
    </DashboardLayout>
  );
}
