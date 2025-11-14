'use client';

import { useState, useEffect } from 'react';
import { Building2, Palette, Search, MapPin, Users, Save, Loader2, Plus, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SettingsSection from '@/components/settings/SettingsSection';
import UpgradeBanner from '@/components/UpgradeBanner';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function BusinessSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Business info state
  const [businessData, setBusinessData] = useState({
    name: '',
    category: 'BEAUTICIAN',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postcode: '',
    website: '',
  });

  // Branding state
  const [brandingData, setBrandingData] = useState({
    primaryColor: '#EC4899',
    accentColor: '#9333EA',
    font: 'Inter',
  });

  // SEO state
  const [seoData, setSeoData] = useState({
    metaTitle: '',
    metaDescription: '',
    keywords: [] as string[],
  });

  // Social links state
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    website: '',
  });

  const [locations, setLocations] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const isPro = user?.business?.plan === 'PRO' || user?.business?.plan === 'ENTERPRISE';
  const isStarter = user?.business?.plan === 'STARTER';
  const isFree = user?.business?.plan === 'FREE';

  useEffect(() => {
    loadBusinessData();
    loadLocations();
    loadStaff();
    loadBusinessSettings();
  }, []);

  const loadBusinessData = async () => {
    try {
      const response = await api.get('/business/details');
      const business = response.data;
      setBusinessData({
        name: business.name || '',
        category: business.category || 'BEAUTICIAN',
        description: business.description || '',
        phone: business.phone || '',
        email: business.email || '',
        address: business.address || '',
        city: business.city || '',
        postcode: business.postcode || '',
        website: business.website || '',
      });
    } catch (error) {
      console.error('Failed to load business data:', error);
    }
  };

  const loadBusinessSettings = async () => {
    try {
      const response = await api.get('/settings/business');
      const settings = response.data;
      
      if (settings.branding) {
        setBrandingData({
          primaryColor: settings.branding.primaryColor || '#EC4899',
          accentColor: settings.branding.accentColor || '#9333EA',
          font: settings.branding.font || 'Inter',
        });
      }

      if (settings.seo) {
        setSeoData({
          metaTitle: settings.seo.metaTitle || '',
          metaDescription: settings.seo.metaDescription || '',
          keywords: settings.seo.keywords || [],
        });
      }

      if (settings.socialLinks) {
        setSocialLinks({
          instagram: settings.socialLinks.instagram || '',
          facebook: settings.socialLinks.facebook || '',
          twitter: settings.socialLinks.twitter || '',
          linkedin: settings.socialLinks.linkedin || '',
          website: settings.socialLinks.website || '',
        });
      }
    } catch (error) {
      console.error('Failed to load business settings:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await api.get('/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const loadStaff = async () => {
    try {
      const response = await api.get('/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Failed to load staff:', error);
    }
  };

  const handleSaveBusinessInfo = async () => {
    setLoading(true);
    try {
      await api.patch('/business/details', businessData);
      toast.success('Business information updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update business info');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!isPro) {
      toast.error('Branding is a Pro feature');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/settings/business/branding', brandingData);
      toast.success('Branding updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update branding');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSEO = async () => {
    if (!isPro) {
      toast.error('SEO settings are a Pro feature');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/settings/business/seo', seoData);
      toast.success('SEO settings updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update SEO');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSocial = async () => {
    setLoading(true);
    try {
      await api.patch('/settings/business/social', socialLinks);
      toast.success('Social links updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update social links');
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !seoData.keywords.includes(keywordInput.trim())) {
      setSeoData({ ...seoData, keywords: [...seoData.keywords, keywordInput.trim()] });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setSeoData({ ...seoData, keywords: seoData.keywords.filter(k => k !== keyword) });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Configure your business information and branding</p>
        </div>

        {/* Business Information */}
        <SettingsSection title="Business Information" description="Update your business details">
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={businessData.name}
                  onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={businessData.category}
                  onChange={(e) => setBusinessData({ ...businessData, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                >
                  <option value="BEAUTICIAN">Beautician</option>
                  <option value="HAIRDRESSER">Hairdresser</option>
                  <option value="BARBER">Barber</option>
                  <option value="NAIL_TECH">Nail Technician</option>
                  <option value="MASSAGE">Massage Therapist</option>
                  <option value="SPA">Spa & Wellness</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={businessData.email}
                  onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                  placeholder="+44 7700 900000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description {!isPro && <span className="text-purple-600 text-xs">(Pro only for full access)</span>}
              </label>
              <textarea
                rows={4}
                value={businessData.description}
                onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                disabled={isFree}
                maxLength={isPro ? undefined : 100}
                placeholder="Tell clients about your business..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition disabled:bg-gray-50 disabled:text-gray-500"
              />
              {!isPro && <p className="text-xs text-gray-600 mt-1">Free/Starter: Limited to 100 characters</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={businessData.address}
                  onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={businessData.city}
                  onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postcode</label>
                <input
                  type="text"
                  value={businessData.postcode}
                  onChange={(e) => setBusinessData({ ...businessData, postcode: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveBusinessInfo}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Branding (Pro Only) */}
        <SettingsSection title="Branding" description="Customize your brand colors and fonts">
          {!isPro ? (
            <UpgradeBanner feature="Branding customization" />
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={brandingData.primaryColor}
                      onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                      className="h-11 w-16 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandingData.primaryColor}
                      onChange={(e) => setBrandingData({ ...brandingData, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={brandingData.accentColor}
                      onChange={(e) => setBrandingData({ ...brandingData, accentColor: e.target.value })}
                      className="h-11 w-16 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandingData.accentColor}
                      onChange={(e) => setBrandingData({ ...brandingData, accentColor: e.target.value })}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                  <select
                    value={brandingData.font}
                    onChange={(e) => setBrandingData({ ...brandingData, font: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveBranding}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                  Save Branding
                </button>
              </div>
            </div>
          )}
        </SettingsSection>

        {/* SEO Settings (Pro Only) */}
        <SettingsSection title="SEO Settings" description="Optimize your search engine visibility">
          {!isPro ? (
            <UpgradeBanner feature="SEO optimization" />
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={seoData.metaTitle}
                  onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                  maxLength={60}
                  placeholder="Best Beauty Salon in London - GlamBooking"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-600 mt-1">{seoData.metaTitle.length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  rows={3}
                  value={seoData.metaDescription}
                  onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                  maxLength={160}
                  placeholder="Professional beauty services including haircuts, nails, and spa treatments. Book online today!"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-600 mt-1">{seoData.metaDescription.length}/160 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Add keyword..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seoData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {keyword}
                      <button onClick={() => removeKeyword(keyword)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveSEO}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Save SEO Settings
                </button>
              </div>
            </div>
          )}
        </SettingsSection>

        {/* Social Links */}
        <SettingsSection title="Social Links" description="Connect your social media profiles">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="text"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  placeholder="@yourbusiness"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="text"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  placeholder="facebook.com/yourbusiness"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                <input
                  type="text"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  placeholder="@yourbusiness"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="text"
                  value={socialLinks.linkedin}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  placeholder="linkedin.com/company/yourbusiness"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={socialLinks.website}
                onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                placeholder="https://yourbusiness.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveSocial}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Social Links
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Locations Overview */}
        <SettingsSection title="Locations" description={`${isFree || isStarter ? 'Free/Starter: 1 location only' : 'Manage your business locations'}`}>
          <div className="space-y-3">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{location.name}</p>
                    <p className="text-sm text-gray-600">{location.city}, {location.postcode}</p>
                  </div>
                </div>
                {location.isPrimary && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    Primary
                  </span>
                )}
              </div>
            ))}
            {(isFree || isStarter) && locations.length >= 1 && (
              <p className="text-sm text-gray-600">Upgrade to Pro to add more locations</p>
            )}
          </div>
        </SettingsSection>

        {/* Staff Overview */}
        <SettingsSection title="Staff" description={`${isFree || isStarter ? 'Free/Starter: Owner only' : 'Manage your team members'}`}>
          <div className="space-y-3">
            {staff.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {member.role || 'Staff'}
                </span>
              </div>
            ))}
            {(isFree || isStarter) && (
              <p className="text-sm text-gray-600">Upgrade to Pro to invite team members</p>
            )}
          </div>
        </SettingsSection>
      </div>
    </DashboardLayout>
  );
}
