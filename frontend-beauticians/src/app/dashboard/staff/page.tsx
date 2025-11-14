'use client';

import { useEffect, useState } from 'react';
import { UserCog, Plus, Edit2, Trash2, Crown, Mail, Shield, MapPin, X, Check, RefreshCw, Copy, Clock } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
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
  STARTER: 1, // Owner only
  PRO: 999, // Unlimited
};

export default function StaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
  const canAddMore = staff.length < limit;

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [staffResponse, locationsResponse] = await Promise.all([
        api.get('/staff'),
        api.get('/locations'),
      ]);
      setStaff(staffResponse.data);
      setLocations(locationsResponse.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load staff');
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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your team members and permissions ({staff.length}/{limit === 999 ? '∞' : limit})
            </p>
          </div>
          <button
            onClick={() => canAddMore ? openInviteModal() : toast.error('Upgrade required')}
            disabled={!canAddMore && userPlan !== 'PRO'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              canAddMore
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Mail className="w-4 h-4" />
            Invite Team Member
          </button>
        </div>

        {/* Upgrade Banner */}
        {!canAddMore && userPlan !== 'PRO' && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Crown className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">Team Member Limit Reached</h3>
                <p className="text-sm text-gray-700 mb-4">
                  {userPlan === 'STARTER' 
                    ? 'Starter plan includes only 1 staff member (the owner). Upgrade to Pro to add team members.' 
                    : 'Free plan includes only 1 staff member (the owner). Upgrade to Pro to add team members.'}
                </p>
                <a
                  href="/dashboard/billing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade Now
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Staff List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No team members yet</p>
              {canAddMore && (
                <button
                  onClick={openInviteModal}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Invite your first team member
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Locations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{member.name}</div>
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
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Edit permissions"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
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
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
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
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
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
    </DashboardLayout>
  );
}
