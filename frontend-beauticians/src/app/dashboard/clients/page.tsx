'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Mail, Phone, Calendar, Tag, Star, Filter, Eye, Edit, Trash2, MapPin, AlertCircle, X } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import ClientModal from '@/components/modals/ClientModal';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  birthday: string | null;
  address: string | null;
  occupation: string | null;
  referralSource: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  allergies: string | null;
  medicalConditions: string | null;
  skinType: string | null;
  preferences: string | null;
  notes: string | null;
  internalNotes: string | null;
  tags: string[];
  marketingConsent: boolean;
  smsConsent: boolean;
  emailConsent: boolean;
  vipStatus: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
  };
}

export default function ClientsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    loadClients();
  }, [authLoading, user]);

  async function loadClients() {
    setLoading(true);
    try {
      const response = await api.get('/clients', { 
        params: { limit: 100, offset: 0 } 
      });
      setClients(response.data.clients || []);
    } catch (error: any) {
      console.error('Failed to load clients:', error);
      if (error.response?.status === 401) {
        router.replace('/login');
      } else {
        toast.error('Failed to load clients');
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteClient(clientId: string) {
    if (!confirm('Are you sure you want to delete this client? This will also delete all their bookings.')) return;
    try {
      await api.delete(`/clients/${clientId}`);
      toast.success('Client deleted');
      loadClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast.error('Failed to delete client');
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone && client.phone.includes(searchQuery));
    
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    vip: clients.filter(c => c.vipStatus).length,
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-600 mt-1">{filteredClients.length} total clients</p>
        </div>
        <button
          onClick={() => {
            setSelectedClient(null);
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Client</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-300 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterStatus === status
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clients Table - Desktop */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-300 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Client</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tags</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bookings</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{client.name}</p>
                          {client.vipStatus && (
                            <Star className="w-4 h-4 fill-black text-black" />
                          )}
                        </div>
                        {client.occupation && (
                          <p className="text-xs text-gray-500">{client.occupation}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs">{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs">{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {client.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {client.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-300">
                            {tag}
                          </span>
                        ))}
                        {client.tags.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-300">
                            +{client.tags.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No tags</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {client._count?.bookings || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      client.status === 'active' ? 'bg-white text-black border-black' :
                      'bg-white text-gray-500 border-gray-300'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDetailModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Clients Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-300 p-8 text-center text-gray-500">
            No clients found
          </div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-gray-300 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      {client.vipStatus && (
                        <Star className="w-3.5 h-3.5 fill-black text-black" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{client.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">{client._count?.bookings || 0} bookings</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    client.status === 'active' ? 'bg-white text-black border-black' :
                    'bg-white text-gray-500 border-gray-300'
                  }`}>
                    {client.status}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setShowDetailModal(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setShowModal(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Client Add/Edit Modal */}
      <ClientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSuccess={loadClients}
      />

      {/* Client Detail Modal */}
      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal content will be added in the next component */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedClient.email}</p>
                    </div>
                    {selectedClient.phone && (
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{selectedClient.phone}</p>
                      </div>
                    )}
                    {selectedClient.birthday && (
                      <div>
                        <p className="text-xs text-gray-500">Birthday</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(selectedClient.birthday).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedClient.address && (
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900">{selectedClient.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical & Preferences */}
                {(selectedClient.allergies || selectedClient.medicalConditions || selectedClient.skinType || selectedClient.preferences) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Medical & Preferences</h3>
                    <div className="space-y-3">
                      {selectedClient.allergies && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-red-700">Allergies</p>
                              <p className="text-sm text-red-900">{selectedClient.allergies}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedClient.medicalConditions && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-700">Medical Conditions</p>
                          <p className="text-sm text-gray-900">{selectedClient.medicalConditions}</p>
                        </div>
                      )}
                      {selectedClient.skinType && (
                        <div>
                          <p className="text-xs text-gray-500">Skin Type</p>
                          <p className="text-sm font-medium text-gray-900">{selectedClient.skinType}</p>
                        </div>
                      )}
                      {selectedClient.preferences && (
                        <div>
                          <p className="text-xs text-gray-500">Preferences</p>
                          <p className="text-sm font-medium text-gray-900">{selectedClient.preferences}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {(selectedClient.notes || selectedClient.internalNotes) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Notes</h3>
                    <div className="space-y-3">
                      {selectedClient.notes && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Client Notes</p>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedClient.notes}</p>
                        </div>
                      )}
                      {selectedClient.internalNotes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-yellow-700 mb-1">Internal Notes (Staff Only)</p>
                          <p className="text-sm text-yellow-900 whitespace-pre-wrap">{selectedClient.internalNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedClient.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedClient.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
                      <p className="text-2xl font-bold text-black">{selectedClient._count?.bookings || 0}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className="text-lg font-semibold text-black capitalize">{selectedClient.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
