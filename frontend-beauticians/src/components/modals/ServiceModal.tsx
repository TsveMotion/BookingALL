'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: any;
  onSuccess: () => void;
}

export default function ServiceModal({ isOpen, onClose, service, onSuccess }: ServiceModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'addons' | 'aftercare' | 'waiver'>('basic');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    category: '',
    active: true,
  });
  const [addons, setAddons] = useState<any[]>([]);
  const [newAddon, setNewAddon] = useState({
    name: '',
    description: '',
    priceAdjustment: 0,
    durationAdjustment: 0,
    required: false,
  });
  const [aftercare, setAftercare] = useState({
    title: '',
    content: '',
    sendMethod: 'email',
    sendTrigger: 'immediate',
    sendDelayHours: 0,
  });
  const [waiver, setWaiver] = useState({
    title: '',
    content: '',
    requireSignature: true,
    requireBefore: true,
    autoSend: true,
  });
  const [loading, setLoading] = useState(false);
  const [showAddAddonForm, setShowAddAddonForm] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        duration: service.duration || 60,
        price: service.price || 0,
        category: service.category || '',
        active: service.active ?? true,
      });
      
      // Load service-specific data
      loadServiceData(service.id);
    }
  }, [service]);

  async function loadServiceData(serviceId: string) {
    try {
      // Load addons
      const addonsRes = await api.get(`/addons/service/${serviceId}`);
      setAddons(addonsRes.data || []);

      // Load aftercare
      const aftercareRes = await api.get(`/aftercare/service/${serviceId}`);
      if (aftercareRes.data) {
        setAftercare(aftercareRes.data);
      }

      // Load waiver
      const waiverRes = await api.get(`/waivers/service/${serviceId}`);
      if (waiverRes.data) {
        setWaiver(waiverRes.data);
      }
    } catch (error) {
      console.error('Failed to load service data:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let serviceId = service?.id;

      // Create or update service
      if (service) {
        await api.patch(`/services/${service.id}`, formData);
        toast.success('Service updated');
      } else {
        const res = await api.post('/services', formData);
        serviceId = res.data.id;
        toast.success('Service created');
      }

      // Save aftercare if provided
      if (aftercare.title && aftercare.content && serviceId) {
        await api.post('/aftercare', {
          serviceId,
          ...aftercare,
        });
      }

      // Save waiver if provided
      if (waiver.title && waiver.content && serviceId) {
        await api.post('/waivers', {
          serviceId,
          ...waiver,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save service:', error);
      toast.error(error.response?.data?.error || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddon = async () => {
    if (!newAddon.name || !service?.id) return;

    try {
      await api.post('/addons', {
        serviceId: service.id,
        ...newAddon,
      });
      toast.success('Add-on created');
      loadServiceData(service.id);
      setNewAddon({
        name: '',
        description: '',
        priceAdjustment: 0,
        durationAdjustment: 0,
        required: false,
      });
      setShowAddAddonForm(false);
    } catch (error) {
      console.error('Failed to create addon:', error);
      toast.error('Failed to create add-on');
    }
  };

  const handleDeleteAddon = async (addonId: string) => {
    if (!confirm('Delete this add-on?')) return;

    try {
      await api.delete(`/addons/${addonId}`);
      toast.success('Add-on deleted');
      setAddons(addons.filter(a => a.id !== addonId));
    } catch (error) {
      console.error('Failed to delete addon:', error);
      toast.error('Failed to delete add-on');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">
              {service ? 'Edit Service' : 'New Service'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-4 overflow-x-auto">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'addons', label: `Add-ons ${service ? `(${addons.length})` : ''}` },
                { id: 'aftercare', label: 'Aftercare' },
                { id: 'waiver', label: 'Waiver' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Classic Manicure"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Describe your service..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (£) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Nails, Hair, Facial"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, active: !formData.active })}
                      className={`p-1.5 rounded-lg transition-colors ${
                        formData.active ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {formData.active ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      Service Active
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Add-ons Tab */}
            {activeTab === 'addons' && (
              <div className="space-y-4">
                {!service && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    Save the service first before adding add-ons.
                  </div>
                )}

                {service && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">Add-ons for this service</h3>
                      <button
                        type="button"
                        onClick={() => setShowAddAddonForm(!showAddAddonForm)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add New
                      </button>
                    </div>

                    {showAddAddonForm && (
                      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Add-on name"
                          value={newAddon.name}
                          onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={newAddon.description}
                          onChange={(e) => setNewAddon({ ...newAddon, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Price Adjustment (£)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={newAddon.priceAdjustment}
                              onChange={(e) => setNewAddon({ ...newAddon, priceAdjustment: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Duration Adjustment (min)</label>
                            <input
                              type="number"
                              value={newAddon.durationAdjustment}
                              onChange={(e) => setNewAddon({ ...newAddon, durationAdjustment: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newAddon.required}
                            onChange={(e) => setNewAddon({ ...newAddon, required: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">Required add-on</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddAddon}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                          >
                            Save Add-on
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddAddonForm(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {addons.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        No add-ons yet. Create one above!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {addons.map((addon) => (
                          <div key={addon.id} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{addon.name}</p>
                                {addon.required && (
                                  <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full">Required</span>
                                )}
                              </div>
                              {addon.description && (
                                <p className="text-sm text-gray-600 mt-0.5">{addon.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                <span>{addon.priceAdjustment >= 0 ? '+' : ''}£{addon.priceAdjustment.toFixed(2)}</span>
                                {addon.durationAdjustment !== 0 && (
                                  <span>{addon.durationAdjustment >= 0 ? '+' : ''}{addon.durationAdjustment} min</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddon(addon.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Aftercare Tab */}
            {activeTab === 'aftercare' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Title
                  </label>
                  <input
                    type="text"
                    value={aftercare.title}
                    onChange={(e) => setAftercare({ ...aftercare, title: e.target.value })}
                    placeholder="e.g., Post-Manicure Care"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={aftercare.content}
                    onChange={(e) => setAftercare({ ...aftercare, content: e.target.value })}
                    rows={8}
                    placeholder="Enter aftercare instructions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Send Method
                    </label>
                    <select
                      value={aftercare.sendMethod}
                      onChange={(e) => setAftercare({ ...aftercare, sendMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Send Trigger
                    </label>
                    <select
                      value={aftercare.sendTrigger}
                      onChange={(e) => setAftercare({ ...aftercare, sendTrigger: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="immediate">Immediately after appointment</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                </div>

                {aftercare.sendTrigger === 'delayed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delay (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={aftercare.sendDelayHours}
                      onChange={(e) => setAftercare({ ...aftercare, sendDelayHours: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Waiver Tab */}
            {activeTab === 'waiver' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waiver Title
                  </label>
                  <input
                    type="text"
                    value={waiver.title}
                    onChange={(e) => setWaiver({ ...waiver, title: e.target.value })}
                    placeholder="e.g., Service Agreement & Waiver"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waiver Content
                  </label>
                  <textarea
                    value={waiver.content}
                    onChange={(e) => setWaiver({ ...waiver, content: e.target.value })}
                    rows={10}
                    placeholder="Enter waiver terms and conditions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waiver.requireSignature}
                      onChange={(e) => setWaiver({ ...waiver, requireSignature: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Require signature</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waiver.requireBefore}
                      onChange={(e) => setWaiver({ ...waiver, requireBefore: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Must sign before appointment</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={waiver.autoSend}
                      onChange={(e) => setWaiver({ ...waiver, autoSend: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Auto-send to clients</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
