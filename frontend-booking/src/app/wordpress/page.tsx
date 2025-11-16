'use client';

import { Download, CheckCircle, Code, Blocks, FileCode } from 'lucide-react';
import Link from 'next/link';

export default function WordPressPage() {
  const handleDownload = () => {
    window.location.href = '/wordpress/glambooking-plugin.zip';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-black">
                GlamBooking
              </span>
            </Link>
            <Link
              href="https://beauticians.glambooking.co.uk"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-full text-sm font-medium mb-6 border border-gray-300">
            <CheckCircle className="w-4 h-4" />
            WordPress Plugin
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-black">
            WordPress Integration
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Embed your GlamBooking appointment system directly into your WordPress website. 
            Compatible with Elementor, Gutenberg, and shortcodes.
          </p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all shadow-lg"
          >
            <Download className="w-6 h-6" />
            Download Plugin (v1.0.0)
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Built by <a href="https://glambooking.co.uk" className="text-black hover:underline font-medium">Glambooking.co.uk</a>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Three Ways to Integrate</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white border-2 border-gray-900 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">Shortcode</h3>
              <p className="text-gray-600 mb-4">
                Add booking widgets anywhere with a simple shortcode.
              </p>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded block border border-gray-300">
                [glambooking]
              </code>
            </div>

            <div className="p-6 bg-white border-2 border-gray-900 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <Blocks className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">Gutenberg Block</h3>
              <p className="text-gray-600 mb-4">
                Native WordPress block editor integration.
              </p>
              <p className="text-sm text-gray-500">
                Search "GlamBooking" in block editor
              </p>
            </div>

            <div className="p-6 bg-white border-2 border-gray-900 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                <FileCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">Elementor Widget</h3>
              <p className="text-gray-600 mb-4">
                Drag-and-drop widget for Elementor page builder.
              </p>
              <p className="text-sm text-gray-500">
                Find in Elementor widget panel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Steps */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Installation Steps</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Download Plugin</h3>
                <p className="text-gray-600">
                  Click the download button above to get the latest version of the GlamBooking WordPress plugin.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Upload to WordPress</h3>
                <p className="text-gray-600">
                  Go to <strong>Plugins → Add New → Upload Plugin</strong> in your WordPress admin panel and upload the ZIP file.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Configure API Keys</h3>
                <p className="text-gray-600">
                  Get your API keys from <a href="https://beauticians.glambooking.co.uk/dashboard/settings" className="text-black hover:underline font-medium">GlamBooking Settings</a> and enter them in <strong>GlamBooking → Settings</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">Add Booking Widget</h3>
                <p className="text-gray-600">
                  Use the shortcode, Gutenberg block, or Elementor widget to add booking functionality to any page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-black">Requirements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border-2 border-gray-900 rounded-xl">
              <h3 className="font-bold mb-2 text-black">WordPress</h3>
              <p className="text-gray-600">Version 5.8 or higher</p>
            </div>
            <div className="p-6 bg-white border-2 border-gray-900 rounded-xl">
              <h3 className="font-bold mb-2 text-black">PHP</h3>
              <p className="text-gray-600">Version 7.4 or higher</p>
            </div>
            <div className="p-6 bg-white border-2 border-gray-900 rounded-xl">
              <h3 className="font-bold mb-2 text-black">GlamBooking Account</h3>
              <p className="text-gray-600">Active PRO plan required</p>
            </div>
            <div className="p-6 bg-white border-2 border-gray-900 rounded-xl">
              <h3 className="font-bold mb-2 text-black">API Keys</h3>
              <p className="text-gray-600">Generated from dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white border-t-2 border-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-black">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Download the plugin and start accepting bookings on your WordPress site today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg">
              <Download className="w-5 h-5" />
              Download Plugin
            </button>
            <Link
              href="https://beauticians.glambooking.co.uk/dashboard/settings"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-900 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-all">
              Get API Keys
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-gray-900 bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p className="mb-2">
            Built by <a href="https://glambooking.co.uk" className="text-black hover:underline font-medium">Glambooking.co.uk</a>
          </p>
          <p className="text-sm">
            Need help? Visit our{' '}
            <a href="https://beauticians.glambooking.co.uk" className="text-black hover:underline font-medium">
              dashboard
            </a>{' '}
            or contact support.
          </p>
        </div>
      </footer>
    </div>
  );
}
