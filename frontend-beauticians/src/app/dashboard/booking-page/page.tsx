'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Palette, Globe, Clock, CreditCard, FileText, Eye, Monitor, Smartphone, Lock, Crown, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface BookingPageSettings {
  enabled: boolean;
  primaryColor: string;
  logo?: string;
  coverImage?: string;
  heroTitle?: string;
  heroDescription?: string;
  welcomeMessage?: string;
  thankYouMessage?: string;
  metaTitle?: string;
  metaDescription?: string;
  requireDeposit: boolean;
  depositPercent: number;
  allowOnlinePayment: boolean;
  requireApproval: boolean;
  cancellationPolicy?: string;
  cancellationHours: number;
}

export default function BookingPageEditor() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [settings, setSettings] = useState<BookingPageSettings>({
    enabled: true,
    primaryColor: '#000000',
    requireDeposit: false,
    depositPercent: 20,
    allowOnlinePayment: true,
    requireApproval: false,
    cancellationHours: 24,
  });

  const currentPlan = (user as any)?.business?.plan?.toUpperCase() || 'FREE';
  const isPaidPlan = ['STARTER', 'PRO', 'BUSINESS'].includes(currentPlan);
  const businessName = (user as any)?.business?.name || 'Your Business';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    loadSettings();
  }, [authLoading, user, router]);

  async function loadSettings() {
    try {
      const response = await api.get('/booking-page/me');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load booking page settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch('/booking-page', settings);
      toast.success('Booking page settings saved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  const UpgradeBanner = () => (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">Unlock Full Customization</h3>
          <p className="text-sm text-gray-300 mb-4">
            Upgrade to Starter or Pro to access all booking page customization options, including branding, SEO, payment settings, and more.
          </p>
          <a
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-bold hover:bg-gray-100 transition-all shadow-lg"
          >
            <Crown className="w-4 h-4" />
            Upgrade Now
          </a>
        </div>
      </div>
    </div>
  );

  const LivePreview = () => (
    <div className="sticky top-6">
      <div className="bg-white rounded-xl border border-gray-300 overflow-hidden shadow-lg">
        <div className="bg-gray-50 border-b border-gray-300 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">Live Preview</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded-lg transition ${
                previewMode === 'desktop' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded-lg transition ${
                previewMode === 'mobile' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className={`bg-gray-100 p-6 ${previewMode === 'mobile' ? 'flex justify-center' : ''}`}>
          <div
            className={`bg-white rounded-lg shadow-xl overflow-hidden ${
              previewMode === 'mobile' ? 'w-[375px]' : 'w-full'
            }`}
          >
            {/* Preview Hero Section */}
            <div
              className="p-8 text-white"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {settings.logo && (
                <img src={settings.logo} alt="Logo" className="h-12 mb-4" />
              )}
              <h1 className="text-3xl font-bold mb-3">
                {settings.heroTitle || `Book an appointment with ${businessName}`}
              </h1>
              <p className="text-white/90">
                {settings.heroDescription || `Experience premium beauty treatments at ${businessName}. Book your appointment online in just a few clicks.`}
              </p>
            </div>

            {/* Preview Content */}
            <div className="p-6">
              {settings.welcomeMessage && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{settings.welcomeMessage}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>

              <button
                className="w-full mt-6 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: settings.primaryColor }}
              >
                Continue
              </button>

              {settings.cancellationPolicy && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-gray-700">{settings.cancellationPolicy}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-black animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading booking page editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Booking Page Editor</h1>
          <p className="text-sm text-gray-600 mt-1">
            Customize your public booking page • {isPaidPlan ? 'Full access' : 'Limited access'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-sm disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Upgrade Banner for FREE users */}
      {!isPaidPlan && <UpgradeBanner />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Settings */}
        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Enable Booking Page</h3>
                <p className="text-sm text-gray-600 mt-1">Allow clients to book appointments online</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white rounded-xl border border-gray-300 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Branding</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="w-14 h-14 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {!isPaidPlan && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span>Logo and cover image customization available on paid plans</span>
                  </div>
                </div>
              )}

              {isPaidPlan && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Logo URL</label>
                    <input
                      type="url"
                      value={settings.logo || ''}
                      onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image URL</label>
                    <input
                      type="url"
                      value={settings.coverImage || ''}
                      onChange={(e) => setSettings({ ...settings, coverImage: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div className={`bg-white rounded-xl border border-gray-300 p-5 shadow-sm ${!isPaidPlan ? 'relative' : ''}`}>
            {!isPaidPlan && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">Upgrade to unlock</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Page Content</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={settings.heroTitle || ''}
                  onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                  disabled={!isPaidPlan}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm disabled:bg-gray-50"
                  placeholder="Book an appointment with us"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hero Description</label>
                <textarea
                  value={settings.heroDescription || ''}
                  onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                  disabled={!isPaidPlan}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none text-sm disabled:bg-gray-50"
                  placeholder="Experience premium beauty treatments..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Message</label>
                <textarea
                  value={settings.welcomeMessage || ''}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  disabled={!isPaidPlan}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none text-sm disabled:bg-gray-50"
                  placeholder="Welcome to our booking system..."
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className={`bg-white rounded-xl border border-gray-300 p-5 shadow-sm ${!isPaidPlan ? 'relative' : ''}`}>
            {!isPaidPlan && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">Upgrade to unlock</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">SEO Settings</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={settings.metaTitle || ''}
                  onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                  disabled={!isPaidPlan}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm disabled:bg-gray-50"
                  placeholder="Book Appointment | Your Business Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={settings.metaDescription || ''}
                  onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                  disabled={!isPaidPlan}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none text-sm disabled:bg-gray-50"
                  placeholder="Book your beauty appointment online..."
                />
              </div>
            </div>
          </div>

          {/* Booking & Payment Settings */}
          <div className={`bg-white rounded-xl border border-gray-300 p-5 shadow-sm ${!isPaidPlan ? 'relative' : ''}`}>
            {!isPaidPlan && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">Upgrade to unlock</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Booking & Payment Settings</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Allow Online Payment</p>
                  <p className="text-xs text-gray-600">Enable Stripe payments for bookings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowOnlinePayment}
                    onChange={(e) => setSettings({ ...settings, allowOnlinePayment: e.target.checked })}
                    disabled={!isPaidPlan}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black peer-disabled:opacity-50"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Require Approval</p>
                  <p className="text-xs text-gray-600">Manually approve each booking</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireApproval}
                    onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                    disabled={!isPaidPlan}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black peer-disabled:opacity-50"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className={`bg-white rounded-xl border border-gray-300 p-5 shadow-sm ${!isPaidPlan ? 'relative' : ''}`}>
            {!isPaidPlan && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">Upgrade to unlock</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Cancellation Policy</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cancellation Window (hours)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.cancellationHours}
                  onChange={(e) => setSettings({ ...settings, cancellationHours: Number(e.target.value) })}
                  disabled={!isPaidPlan}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Hours before appointment that cancellation is allowed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cancellation Policy Text</label>
                <textarea
                  value={settings.cancellationPolicy || ''}
                  onChange={(e) => setSettings({ ...settings, cancellationPolicy: e.target.value })}
                  disabled={!isPaidPlan}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black resize-none text-sm disabled:bg-gray-50"
                  placeholder="Please cancel at least 24 hours in advance..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div>
          <LivePreview />
        </div>
      </div>
    </div>
  );
}
