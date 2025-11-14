'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Download, Mail, MessageSquare, Filter, Search, Crown } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'returning' | 'unresponsive';
  source: string;
  lastContact?: Date;
  bookingsCount: number;
  totalSpent: number;
  createdAt: Date;
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  returning: 'bg-green-100 text-green-800 border-green-200',
  unresponsive: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function FunnelPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadLeads() {
    try {
      const response = await api.get('/clients');
      
      // API returns {clients, total, limit, offset}
      const clientsData = response.data.clients || [];
      
      // Transform clients to leads format
      const transformedLeads: Lead[] = clientsData.map((client: any) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        status: determineStatus(client),
        source: 'Booking',
        lastContact: client.updatedAt ? new Date(client.updatedAt) : undefined,
        bookingsCount: client._count?.bookings || 0,
        totalSpent: client.totalSpent || 0,
        createdAt: new Date(client.createdAt),
      }));

      setLeads(transformedLeads);
    } catch (error) {
      console.error('Failed to load leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }

  function determineStatus(client: any): 'new' | 'returning' | 'unresponsive' {
    const bookingsCount = client._count?.bookings || 0;
    if (bookingsCount === 0) return 'new';
    if (bookingsCount >= 2) return 'returning';
    
    // Check if last contact was over 30 days ago
    const lastContact = client.updatedAt ? new Date(client.updatedAt) : new Date(client.createdAt);
    const daysSinceContact = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceContact > 30 && bookingsCount === 1) return 'unresponsive';
    
    return 'new';
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Bookings', 'Total Spent', 'Created At'];
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.email,
      lead.phone,
      lead.status,
      lead.bookingsCount,
      `£${lead.totalSpent.toFixed(2)}`,
      new Date(lead.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Leads exported successfully!');
  };

  const filteredLeads = leads.filter(lead => {
    const matchesFilter = filter === 'all' || lead.status === filter;
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    returning: leads.filter(l => l.status === 'returning').length,
    unresponsive: leads.filter(l => l.status === 'unresponsive').length,
  };

  // Check if user has access to funnel feature
  const userPlan = (user as any)?.business?.plan || 'FREE';
  const hasAccess = ['STARTER', 'PRO', 'BUSINESS'].includes(userPlan);

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12 px-6 text-center">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 p-12">
            <Crown className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Marketing Funnel</h2>
            <p className="text-lg text-gray-600 mb-6">
              Track and manage your client pipeline with advanced funnel tools
            </p>
            <div className="bg-white rounded-xl p-6 mb-8 border border-purple-100">
              <p className="text-sm text-gray-700 mb-4">This feature is available on:</p>
              <div className="flex justify-center gap-4">
                <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-semibold">
                  Starter Plan - £29/month
                </div>
                <div className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold">
                  Pro Plan - £59/month
                </div>
              </div>
            </div>
            <a
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              <Crown className="w-5 h-5" />
              Upgrade Now
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Marketing Funnel</h1>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                STARTER
              </span>
            </div>
            <p className="text-sm text-gray-600">Track and nurture your client pipeline</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">New Leads</p>
              <div className="w-3 h-3 rounded-full bg-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Returning</p>
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.returning}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Unresponsive</p>
              <div className="w-3 h-3 rounded-full bg-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.unresponsive}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'new', 'returning', 'unresponsive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-xs text-gray-500">
                            Added {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{lead.email}</div>
                        <div className="text-xs text-gray-500">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[lead.status]}`}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.bookingsCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        £{lead.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toast.success('Email feature coming soon!')}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toast.success('SMS feature coming soon!')}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Send SMS"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Marketing Funnel FAQ</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-900 mb-1">What is a marketing funnel?</p>
              <p className="text-sm text-gray-600">
                A marketing funnel helps you track potential clients through their journey from first contact to becoming loyal customers.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">How are leads categorized?</p>
              <p className="text-sm text-gray-600">
                <strong>New:</strong> First-time clients with no bookings yet. <strong>Returning:</strong> Clients with 2+ bookings. <strong>Unresponsive:</strong> Clients who haven't booked in 30+ days.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">Can I export my leads?</p>
              <p className="text-sm text-gray-600">
                Yes! Click "Export CSV" to download all your leads data for use in other tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
