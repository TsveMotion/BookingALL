'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCog, Plus, Edit2, Trash2, Crown, Mail, Shield, MapPin, X, Check, RefreshCw, Copy, Clock, AlertCircle, Zap } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { StaffPermissions, DEFAULT_PERMISSIONS, PERMISSION_LABELS } from '@/types/permissions';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  assignedLocationIds: string[];
  permissions: StaffPermissions;
  status: string; // 'pending', 'active', 'inactive'
  active: boolean;
  inviteAccepted: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Location {
  id: string;
  name: string;
}

const PLAN_LIMITS = {
  FREE: 1, // Owner only
  STARTER: 3, // Owner + 2 staff members
  PRO: 999, // Unlimited
};

export default function StaffPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    assignedLocationIds: [] as string[],
    permissions: DEFAULT_PERMISSIONS,
  });

  const userPlan = (user as any)?.business?.plan || 'FREE';
  const limit = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS];
  const ownerEmail = user?.email?.toLowerCase();
  const nonOwnerStaff = staff.filter(s => s.email.toLowerCase() !== ownerEmail);
  const canAddMore = staff.length < limit;

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
      const [staffResponse, locationsResponse] = await Promise.all([
        api.get('/staff'),
        api.get('/locations'),
      ]);
      
      // Show ALL staff members including the owner
      const staffData = staffResponse.data || [];
      
      setStaff(staffData);
      setLocations(locationsResponse.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.replace('/login');
      } else {
        console.error('Failed to load data:', error);
        toast.error('Failed to load staff');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await api.post('/staff/invite', formData);
      toast.success('Staff invitation sent successfully!');
      setShowInviteModal(false);
      resetForm();
      void loadData();
    } catch (error: any) {
      if (error.response?.status === 403) {
        toast.error(error.response.data.message || 'Upgrade required');
      } else {
        toast.error(error.response?.data?.error || 'Failed to invite staff member');
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingStaff) return;

    try {
      await api.patch(`/staff/${editingStaff.id}`, {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        assignedLocationIds: formData.assignedLocationIds,
        permissions: formData.permissions,
      });
      toast.success('Staff member updated successfully!');
      setShowEditModal(false);
      resetForm();
      void loadData();
    } catch (error) {
      toast.error('Failed to update staff member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    
    try {
      await api.delete(`/staff/${id}`);
      toast.success('Staff member removed successfully!');
      void loadData();
    } catch (error) {
      toast.error('Failed to remove staff member');
    }
  };

  const handleResendInvite = async (id: string) => {
    try {
      await api.post(`/staff/${id}/resend-invite`);
      toast.success('Invitation resent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend invitation');
    }
  };

  const handleCopyInviteLink = async (email: string) => {
    try {
      // Generate invite link (you'd normally get this from the API)
      const inviteLink = `${window.location.origin}/auth/accept-invite?email=${encodeURIComponent(email)}`;
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy invite link');
    }
  };

  const openInviteModal = () => {
    if (!canAddMore) {
      setShowUpgradeModal(true);
      return;
    }
    resetForm();
    setShowInviteModal(true);
  };

  const openEditModal = (member: Staff) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone || '',
      role: member.role || '',
      assignedLocationIds: member.assignedLocationIds,
      permissions: member.permissions,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      assignedLocationIds: [],
      permissions: DEFAULT_PERMISSIONS,
    });
  };

  const togglePermission = (key: keyof StaffPermissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const toggleLocation = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedLocationIds: prev.assignedLocationIds.includes(locationId)
        ? prev.assignedLocationIds.filter(id => id !== locationId)
        : [...prev.assignedLocationIds, locationId],
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-black animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              {staff.length} team member{staff.length !== 1 ? 's' : ''} ({nonOwnerStaff.length} staff) • {limit === 999 ? 'Unlimited' : `${limit} max on ${userPlan} plan`}
            </p>
          </div>
          <button
            onClick={openInviteModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-sm"
          >
            <Mail className="w-5 h-5" />
            Invite Team Member
          </button>
        </div>

        {/* Plan Info Card */}
        {userPlan !== 'PRO' && (
          <div className="bg-gray-50 border border-gray-300 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Team Plan Limits</h3>
                <p className="text-sm text-gray-700">
                  {userPlan === 'FREE' 
                    ? 'Free plan includes you (the owner) only. Upgrade to Starter for up to 3 team members or Pro for unlimited.'
                    : `Starter plan includes up to 3 team members total (you + 2 staff). Upgrade to Pro for unlimited team members.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Card - Pending Invites Authentication */}
        {nonOwnerStaff.some(s => s.status === 'pending') && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Pending Invitations</h3>
                <p className="text-sm text-gray-700">
                  Staff members with <span className="font-semibold">Pending</span> status need to check their email and create an account by clicking the invitation link. Once they set up their credentials and accept the invite, they'll appear as <span className="font-semibold">Active</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Staff List */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm">
          {staff.length === 0 ? (
            <div className="text-center py-16 px-6">
              <UserCog className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 text-lg mb-2">No staff members yet</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Invite staff members to help manage bookings, clients, and services. {userPlan === 'PRO' ? 'Pro plan allows unlimited team members!' : userPlan === 'STARTER' ? 'Starter plan allows up to 3 team members.' : 'Upgrade to Starter or Pro to add team members.'}
              </p>
              <button
                onClick={openInviteModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Invite First Team Member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Locations</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => {
                    const isOwner = member.email.toLowerCase() === ownerEmail;
                    return (
                    <tr key={member.id} className={`hover:bg-gray-50 transition ${isOwner ? 'bg-amber-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900">{member.name}</div>
                          {isOwner && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                              <Crown className="w-3 h-3" />
                              Owner
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{member.role || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{member.email}</div>
                        <div className="text-xs text-gray-500">{member.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {member.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        ) : member.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.assignedLocationIds.length === 0 ? (
                            <span className="text-xs text-gray-500">All locations</span>
                          ) : (
                            member.assignedLocationIds.map(locId => {
                              const loc = locations.find(l => l.id === locId);
                              return loc ? (
                                <span key={locId} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  <MapPin className="w-3 h-3" />
                                  {loc.name}
                                </span>
                              ) : null;
                            })
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {isOwner ? (
                            <span className="text-xs text-gray-500 italic px-2 py-1">Account owner</span>
                          ) : (
                            <>
                          {member.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleResendInvite(member.id)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Resend invitation"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCopyInviteLink(member.email)}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Copy invite link"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition"
                            title="Edit permissions"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove member"
                            disabled={isOwner}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Upgrade to Pro Plan</h2>
                <p className="text-gray-600 mb-6">
                  {userPlan === 'STARTER' 
                    ? 'Starter plan is limited to 3 team members total (you + 2 staff). Upgrade to Pro for unlimited team members.'
                    : 'Free plan is limited to 1 team member (you, the owner). Upgrade to Starter for 3 members or Pro for unlimited.'}
                </p>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Current Plan</p>
                      <p className="text-lg font-bold text-gray-900">{userPlan}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Team Limit</p>
                      <p className="text-lg font-bold text-gray-900">{limit} {limit === 1 ? 'Member' : 'Members'}</p>
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

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
                <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      placeholder="e.g., Stylist, Manager"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                {/* Location Assignment */}
                {locations.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Locations</label>
                    <div className="grid grid-cols-2 gap-2">
                      {locations.map((location) => (
                        <label key={location.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedLocationIds.includes(location.id)}
                            onChange={() => toggleLocation(location.id)}
                            className="w-4 h-4 text-black rounded focus:ring-black"
                          />
                          <span className="text-sm">{location.name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave empty for access to all locations</p>
                  </div>
                )}

                {/* Permissions Matrix */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Permissions
                  </h3>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                    {(Object.keys(PERMISSION_LABELS) as Array<keyof StaffPermissions>).map((key) => (
                      <label key={key} className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions[key]}
                          onChange={() => togglePermission(key)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{PERMISSION_LABELS[key].label}</div>
                          <div className="text-xs text-gray-500">{PERMISSION_LABELS[key].description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowInviteModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit Team Member</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Location Assignment */}
                {locations.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Locations</label>
                    <div className="grid grid-cols-2 gap-2">
                      {locations.map((location) => (
                        <label key={location.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedLocationIds.includes(location.id)}
                            onChange={() => toggleLocation(location.id)}
                            className="w-4 h-4 text-black rounded focus:ring-black"
                          />
                          <span className="text-sm">{location.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Permissions Matrix */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Permissions
                  </h3>
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                    {(Object.keys(PERMISSION_LABELS) as Array<keyof StaffPermissions>).map((key) => (
                      <label key={key} className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions[key]}
                          onChange={() => togglePermission(key)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 mt-1"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{PERMISSION_LABELS[key].label}</div>
                          <div className="text-xs text-gray-500">{PERMISSION_LABELS[key].description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); resetForm(); }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    Update Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
