'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Mail, MessageSquare, Search, Crown, Send, X, Target, TrendingUp, Zap, Link as LinkIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'returning' | 'inactive' | 'highvalue';
  bookingsCount: number;
  totalSpent: number;
  createdAt: Date;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  subject: string;
  message: string;
  targetAudience: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  createdAt: Date;
}

export default function FunnelPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'clients' | 'campaigns'>('clients');
  const [businessSubdomain, setBusinessSubdomain] = useState<string>('');
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    type: 'email' as 'email' | 'sms',
    subject: '',
    message: '',
    targetAudience: 'all' as 'all' | 'new' | 'returning' | 'inactive' | 'highvalue',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    void loadData();
  }, [authLoading, user]);

  async function loadData() {
    try {
      setLoading(true);
      const [clientsRes, campaignsRes, businessRes] = await Promise.all([
        api.get('/clients'),
        api.get('/campaigns'),
        api.get('/business/me'),
      ]);
      
      // Set subdomain for funnel tracking
      const business = businessRes.data;
      if (business?.subdomain) {
        setBusinessSubdomain(business.subdomain);
      } else if (business?.slug) {
        // Use slug as fallback
        setBusinessSubdomain(business.slug);
      }
      
      const clientsData = clientsRes.data.clients || [];
      const transformedClients: Client[] = clientsData.map((client: any) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        status: determineStatus(client),
        bookingsCount: client._count?.bookings || 0,
        totalSpent: client.totalSpent || 0,
        createdAt: new Date(client.createdAt),
      }));

      setClients(transformedClients);
      setCampaigns(campaignsRes.data.campaigns || []);
    } catch (error: any) {
      if (error.response?.status === 403) {
        // Access denied - will be handled by permission check below
        console.log('Funnel access denied - upgrade required');
      } else if (error.response?.status === 401) {
        router.replace('/login');
      } else {
        console.error('Failed to load data:', error);
        toast.error('Failed to load funnel data');
      }
    } finally {
      setLoading(false);
    }
  }

  function determineStatus(client: any): 'new' | 'returning' | 'inactive' | 'highvalue' {
    const bookingsCount = client._count?.bookings || 0;
    if (bookingsCount === 0) return 'new';
    if (bookingsCount >= 5) return 'highvalue';
    if (bookingsCount >= 2) return 'returning';
    
    const lastContact = client.updatedAt ? new Date(client.updatedAt) : new Date(client.createdAt);
    const daysSinceContact = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceContact > 30) return 'inactive';
    
    return 'new';
  }

  const handleCreateCampaign = async () => {
    try {
      if (!campaignForm.name || !campaignForm.message) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (campaignForm.type === 'email' && !campaignForm.subject) {
        toast.error('Email subject is required');
        return;
      }

      await api.post('/campaigns', {
        ...campaignForm,
        clientIds: selectedClients.length > 0 ? selectedClients : undefined,
      });

      toast.success('Campaign created successfully!');
      setShowCreateModal(false);
      setCampaignForm({ name: '', type: 'email', subject: '', message: '', targetAudience: 'all' });
      setSelectedClients([]);
      await loadData();
    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign?')) return;

    try {
      await api.post(`/campaigns/${campaignId}/send`);
      toast.success('Campaign sent successfully!');
      await loadData();
    } catch (error) {
      console.error('Failed to send campaign:', error);
      toast.error('Failed to send campaign');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesFilter = filter === 'all' || client.status === filter;
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: clients.length,
    new: clients.filter(c => c.status === 'new').length,
    returning: clients.filter(c => c.status === 'returning').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    highvalue: clients.filter(c => c.status === 'highvalue').length,
  };

  const userPlan = (user as any)?.business?.plan || 'FREE';
  const hasAccess = ['STARTER', 'PRO', 'BUSINESS'].includes(userPlan);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-black animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading funnel...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-12 text-center">
            <div className="mb-6">
              <Zap className="w-20 h-20 mx-auto mb-4" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Marketing Funnel</h2>
            <p className="text-lg text-gray-300 mb-8">
              Create powerful email & SMS campaigns, track your client pipeline, and grow your business
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
              <p className="text-sm text-gray-300 mb-4 font-semibold uppercase tracking-wide">Premium Feature</p>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="px-5 py-2.5 bg-white text-black rounded-lg font-bold text-sm">Starter Plan</div>
                <div className="px-5 py-2.5 bg-white text-black rounded-lg font-bold text-sm">Pro Plan</div>
                <div className="px-5 py-2.5 bg-white text-black rounded-lg font-bold text-sm">Business Plan</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
              <div className="bg-white/5 rounded-lg p-4">
                <Mail className="w-6 h-6 mb-2" />
                <h3 className="font-semibold mb-1">Email Campaigns</h3>
                <p className="text-sm text-gray-300">Send targeted email campaigns to your clients</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <MessageSquare className="w-6 h-6 mb-2" />
                <h3 className="font-semibold mb-1">SMS Marketing</h3>
                <p className="text-sm text-gray-300">Reach clients instantly via SMS</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <TrendingUp className="w-6 h-6 mb-2" />
                <h3 className="font-semibold mb-1">Analytics</h3>
                <p className="text-sm text-gray-300">Track opens, clicks, and conversions</p>
              </div>
            </div>
            
            <a
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Access Funnel
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Marketing Funnel</h1>
              <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full">PRO</span>
            </div>
            <p className="text-sm text-gray-600">Create campaigns and nurture your client pipeline</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('clients')}
              className={`pb-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'clients' ? 'border-black text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Clients ({stats.total})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`pb-3 px-1 border-b-2 font-medium transition ${
                activeTab === 'campaigns' ? 'border-black text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Campaigns ({campaigns.length})
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'clients' ? (
          <ClientsTab 
            clients={filteredClients}
            stats={stats}
            loading={loading}
            filter={filter}
            setFilter={setFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedClients={selectedClients}
            setSelectedClients={setSelectedClients}
            setShowCreateModal={setShowCreateModal}
          />
        ) : (
          <CampaignsTab 
            campaigns={campaigns}
            loading={loading}
            handleSendCampaign={handleSendCampaign}
            setShowCreateModal={setShowCreateModal}
          />
        )}

        {showCreateModal && (
          <CreateCampaignModal
            campaignForm={campaignForm}
            setCampaignForm={setCampaignForm}
            selectedClients={selectedClients}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateCampaign}
          />
        )}
      {/* Subdomain Info Card */}
      {businessSubdomain && (
        <div className="bg-white rounded-xl border border-gray-300 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">Your Funnel Domain</h3>
              <p className="text-sm text-gray-600 mb-3">All campaign links will use your custom subdomain</p>
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 uppercase font-semibold tracking-wide">Campaign URL</p>
                <p className="text-sm font-mono text-gray-900 font-medium break-all">
                  https://{businessSubdomain}.glambooking.co.uk
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientsTab({ clients, stats, loading, filter, setFilter, searchTerm, setSearchTerm, selectedClients, setSelectedClients, setShowCreateModal }: any) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">{key.charAt(0).toUpperCase() + key.slice(1).replace('highvalue', 'High Value')}</p>
            <p className="text-2xl font-bold text-gray-900">{value as number}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'new', 'returning', 'inactive', 'highvalue'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('highvalue', 'High Value')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No clients found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="w-4 h-4"
                    checked={selectedClients.length === clients.length}
                    onChange={(e) => setSelectedClients(e.target.checked ? clients.map((c: any) => c.id) : [])}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="w-4 h-4"
                      checked={selectedClients.includes(client.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClients([...selectedClients, client.id]);
                        } else {
                          setSelectedClients(selectedClients.filter((id: string) => id !== client.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    <div className="text-xs text-gray-500">{new Date(client.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{client.email}</div>
                    <div className="text-xs text-gray-500">{client.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      client.status === 'new' ? 'bg-gray-100 text-gray-800' :
                      client.status === 'returning' ? 'bg-gray-100 text-gray-800' :
                      client.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-black text-white'
                    }`}>
                      {client.status === 'highvalue' ? 'High Value' : client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{client.bookingsCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">£{client.totalSpent.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedClients.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 z-50">
          <span className="font-semibold">{selectedClients.length} selected</span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Create Campaign
          </button>
          <button onClick={() => setSelectedClients([])} className="p-2 hover:bg-gray-800 rounded transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

function CampaignsTab({ campaigns, loading, handleSendCampaign, setShowCreateModal }: any) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Total Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Active</p>
          <p className="text-2xl font-bold text-gray-900">{campaigns.filter((c: any) => c.status === 'sent').length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Draft</p>
          <p className="text-2xl font-bold text-gray-900">{campaigns.filter((c: any) => c.status === 'draft').length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Scheduled</p>
          <p className="text-2xl font-bold text-gray-900">{campaigns.filter((c: any) => c.status === 'scheduled').length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-black animate-spin mx-auto" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No campaigns yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
            >
              <Plus className="w-4 h-4" />
              Create First Campaign
            </button>
          </div>
        ) : (
          campaigns.map((campaign: any) => (
            <div key={campaign.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      campaign.status === 'sent' ? 'bg-black text-white' :
                      campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                      {campaign.type === 'email' ? <Mail className="w-3 h-3 inline mr-1" /> : <MessageSquare className="w-3 h-3 inline mr-1" />}
                      {campaign.type.toUpperCase()}
                    </span>
                  </div>
                  {campaign.subject && (
                    <p className="text-sm text-gray-600 mb-2">Subject: {campaign.subject}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Target: {campaign.targetAudience} • {campaign.recipientCount} recipients
                  </p>
                </div>
                {campaign.status === 'draft' && (
                  <button
                    onClick={() => handleSendCampaign(campaign.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
                  >
                    <Send className="w-4 h-4" />
                    Send Now
                  </button>
                )}
              </div>

              {campaign.status === 'sent' && (
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{campaign.sentCount}</p>
                    <p className="text-xs text-gray-500">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{campaign.deliveredCount}</p>
                    <p className="text-xs text-gray-500">Delivered</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{campaign.openedCount}</p>
                    <p className="text-xs text-gray-500">Opened</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {campaign.deliveredCount > 0 ? ((campaign.openedCount / campaign.deliveredCount) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-gray-500">Open Rate</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}

function CreateCampaignModal({ campaignForm, setCampaignForm, selectedClients, onClose, onSubmit }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Create Campaign</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={campaignForm.name}
              onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g., Spring Promotion 2024"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Type</label>
              <select
                value={campaignForm.type}
                onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value as 'email' | 'sms' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Target Audience</label>
              <select
                value={campaignForm.targetAudience}
                onChange={(e) => setCampaignForm({ ...campaignForm, targetAudience: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                disabled={selectedClients.length > 0}
              >
                <option value="all">All Clients</option>
                <option value="new">New Clients</option>
                <option value="returning">Returning Clients</option>
                <option value="inactive">Inactive Clients</option>
                <option value="highvalue">High Value Clients</option>
              </select>
            </div>
          </div>

          {selectedClients.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Selected Recipients</p>
              <p className="text-sm text-gray-600">{selectedClients.length} clients selected</p>
            </div>
          )}

          {campaignForm.type === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., Special offer just for you!"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={campaignForm.message}
              onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder={campaignForm.type === 'sms' ? "Keep it short and sweet (max 160 characters)" : "Write your email message here..."}
            />
            {campaignForm.type === 'sms' && (
              <p className="text-xs text-gray-500 mt-1">{campaignForm.message.length}/160 characters</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
