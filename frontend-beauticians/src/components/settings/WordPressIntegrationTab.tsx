'use client';

import { useState, useEffect } from 'react';
import { Download, Key, Copy, Check, ExternalLink, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ApiKeys {
  publicKey: string;
  secretKey: string;
  businessId: string;
}

export default function WordPressIntegrationTab() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const isPro = (user as any)?.business?.plan === 'PRO' || (user as any)?.business?.plan === 'ENTERPRISE';

  useEffect(() => {
    if (isPro) {
      fetchApiKeys();
    } else {
      setLoading(false);
    }
  }, [isPro]);

  const fetchApiKeys = async () => {
    try {
      const response = await api.get('/wordpress/keys');
      setApiKeys(response.data.keys);
    } catch (error) {
      console.error('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const generateKeys = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/wordpress/generate');
      setApiKeys(response.data.keys);
      toast.success('WordPress API keys generated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate API keys');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isPro) {
    return (
      <div className="space-y-6">
        {/* Upgrade CTA */}
        <div className="relative bg-white border-2 border-black/10 rounded-lg p-12 text-center overflow-hidden">
          {/* Blurred Background Content */}
          <div className="absolute inset-0 blur-sm opacity-30 p-8">
            <div className="h-40 bg-black/5 rounded-lg mb-4"></div>
            <div className="h-20 bg-black/5 rounded-lg mb-4"></div>
            <div className="h-32 bg-black/5 rounded-lg"></div>
          </div>

          {/* Lock Icon */}
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">WordPress Integration is PRO Only</h2>
            <p className="text-black/60 mb-6 max-w-md mx-auto">
              Embed your GlamBooking system into your WordPress site with our powerful integration plugin. 
              Available exclusively for PRO plan members.
            </p>
            <Link
              href="/dashboard/settings?tab=billing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-black/90 transition-colors"
            >
              Upgrade to PRO
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'WordPress Plugin', desc: 'Download & install with one click' },
            { title: 'Elementor Support', desc: 'Drag-and-drop booking widget' },
            { title: 'WP Dashboard', desc: 'View bookings in WordPress admin' },
          ].map((feature, i) => (
            <div key={i} className="bg-white border border-black/10 rounded-lg p-4 opacity-50">
              <h3 className="font-semibold text-black mb-1">{feature.title}</h3>
              <p className="text-sm text-black/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Download Plugin Section */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-black mb-2">Download WordPress Plugin</h2>
            <p className="text-sm text-black/60">
              Install the GlamBooking plugin on your WordPress site to embed booking widgets and sync data.
            </p>
          </div>
          <Download className="w-5 h-5 text-black/40" />
        </div>
        <a
          href="https://book.glambooking.co.uk/wordpress/glambooking-plugin.zip"
          download
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-black/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Plugin (v1.0.0)
        </a>
        <p className="text-xs text-black/40 mt-3">
          Built by{' '}
          <a href="https://glambooking.co.uk" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">
            Glambooking.co.uk
          </a>
        </p>
      </div>

      {/* API Keys Section */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-black mb-2">WordPress API Keys</h2>
            <p className="text-sm text-black/60">
              Use these credentials to authenticate your WordPress plugin with GlamBooking.
            </p>
          </div>
          <Key className="w-5 h-5 text-black/40" />
        </div>

        {!apiKeys ? (
          <button
            onClick={generateKeys}
            disabled={generating}
            className="px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-black/90 transition-colors disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate API Keys'}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Public Key */}
            <div>
              <label className="block text-sm font-medium text-black/80 mb-2">Public Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKeys.publicKey}
                  readOnly
                  className="flex-1 px-4 py-2 border border-black/20 rounded-md bg-black/5 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(apiKeys.publicKey, 'public')}
                  className="px-4 py-2 border border-black/20 rounded-md hover:bg-black/5 transition-colors"
                >
                  {copiedField === 'public' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-sm font-medium text-black/80 mb-2">Secret Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeys.secretKey}
                  readOnly
                  className="flex-1 px-4 py-2 border border-black/20 rounded-md bg-black/5 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(apiKeys.secretKey, 'secret')}
                  className="px-4 py-2 border border-black/20 rounded-md hover:bg-black/5 transition-colors"
                >
                  {copiedField === 'secret' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-black/40 mt-1">Keep this secret and never share it publicly</p>
            </div>

            {/* Business ID */}
            <div>
              <label className="block text-sm font-medium text-black/80 mb-2">Business ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKeys.businessId}
                  readOnly
                  className="flex-1 px-4 py-2 border border-black/20 rounded-md bg-black/5 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(apiKeys.businessId, 'business')}
                  className="px-4 py-2 border border-black/20 rounded-md hover:bg-black/5 transition-colors"
                >
                  {copiedField === 'business' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Regenerate Warning */}
            <div className="bg-black/5 border border-black/10 rounded-md p-4 mt-4">
              <p className="text-sm text-black/70">
                <strong>Warning:</strong> Regenerating keys will invalidate your current WordPress integration. 
                You'll need to update the credentials in your WordPress plugin settings.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Installation Guide */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Installation Steps</h2>
        <div className="space-y-4">
          {[
            { step: 1, title: 'Upload Plugin', desc: 'In WordPress admin, go to Plugins → Add New → Upload Plugin, then select the downloaded ZIP file.' },
            { step: 2, title: 'Activate Plugin', desc: 'After installation, click "Activate Plugin" to enable GlamBooking integration.' },
            { step: 3, title: 'Enter API Keys', desc: 'Navigate to GlamBooking → Settings in WordPress and paste your API keys from above.' },
            { step: 4, title: 'Add Booking Widget', desc: 'Use shortcode [glambooking business="YOUR_ID"] or the Elementor widget to embed booking forms.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">{item.title}</h3>
                <p className="text-sm text-black/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shortcode Examples */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Shortcode Examples</h2>
        <div className="space-y-3">
          <div className="bg-black/5 border border-black/10 rounded-md p-3">
            <code className="text-sm font-mono text-black">
              [glambooking business="{apiKeys?.businessId || 'YOUR_BUSINESS_ID'}"]
            </code>
          </div>
          <div className="bg-black/5 border border-black/10 rounded-md p-3">
            <code className="text-sm font-mono text-black">
              [glambooking business="{apiKeys?.businessId || 'YOUR_BUSINESS_ID'}" service="facials"]
            </code>
          </div>
          <div className="bg-black/5 border border-black/10 rounded-md p-3">
            <code className="text-sm font-mono text-black">
              [glambooking business="{apiKeys?.businessId || 'YOUR_BUSINESS_ID'}" theme="minimal"]
            </code>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-black/10 rounded-lg p-4">
          <h3 className="font-semibold text-black mb-2">Elementor Widget</h3>
          <p className="text-sm text-black/60">Drag-and-drop booking widget for Elementor page builder</p>
        </div>
        <div className="bg-white border border-black/10 rounded-lg p-4">
          <h3 className="font-semibold text-black mb-2">Gutenberg Block</h3>
          <p className="text-sm text-black/60">Native WordPress block editor integration</p>
        </div>
        <div className="bg-white border border-black/10 rounded-lg p-4">
          <h3 className="font-semibold text-black mb-2">WP Dashboard</h3>
          <p className="text-sm text-black/60">View bookings and analytics inside WordPress</p>
        </div>
      </div>
    </div>
  );
}
