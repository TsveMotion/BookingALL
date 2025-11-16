'use client';

import { useState } from 'react';
import { Save, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function BusinessTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: user?.business?.name || '',
    description: user?.business?.description || '',
    address: user?.business?.address || '',
    phone: user?.business?.phone || '',
    website: user?.business?.website || '',
    instagram: user?.business?.instagram || '',
    facebook: user?.business?.facebook || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/business/settings', formData);
      toast.success('Business settings updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Logo Section */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Business Logo</h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-lg bg-black/5 flex items-center justify-center border border-black/10">
            <Upload className="w-8 h-8 text-black/40" />
          </div>
          <div>
            <button className="px-4 py-2 border border-black/20 rounded-md hover:bg-black/5 transition-colors text-sm font-medium">
              Upload Logo
            </button>
            <p className="text-xs text-black/40 mt-2">JPG, PNG or SVG. Max 2MB. Recommended 500x500px.</p>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Business Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black/80 mb-2">Business Name</label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-4 py-2 border border-black/20 rounded-md focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/80 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-black/20 rounded-md focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/80 mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-black/20 rounded-md focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black/80 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-black/20 rounded-md focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black/80 mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-black/20 rounded-md focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Social Media</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black/80 mb-2">Instagram</label>
            <input
              type="text"
              placeholder="@yourbusiness"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="w-full px-4 py-2 border border-black/20 rounded-md focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black/80 mb-2">Facebook</label>
            <input
              type="text"
              placeholder="facebook.com/yourbusiness"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              className="w-full px-4 py-2 border border-black/20 rounded-md focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
