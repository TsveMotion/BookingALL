'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700">
                Welcome to GlamBooking. We respect your privacy and are committed to protecting your personal data.
                This privacy policy will inform you about how we look after your personal data and tell you about
                your privacy rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data We Collect</h2>
              <p className="text-gray-700 mb-4">We may collect, use, store and transfer different kinds of personal data about you:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Identity Data (name, business name)</li>
                <li>Contact Data (email address, telephone numbers)</li>
                <li>Financial Data (payment card details)</li>
                <li>Transaction Data (bookings, services)</li>
                <li>Technical Data (IP address, browser type)</li>
                <li>Usage Data (how you use our platform)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Data</h2>
              <p className="text-gray-700 mb-4">We use your data to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide and manage your booking services</li>
                <li>Process your payments</li>
                <li>Send you important updates about your account</li>
                <li>Improve our platform and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-700">
                We have implemented appropriate security measures to prevent your personal data from being
                accidentally lost, used, or accessed in an unauthorized way. All payment information is encrypted
                and processed through our secure payment provider, Stripe.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Request access to your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this privacy policy or our privacy practices, please contact us at:{' '}
                <a href="mailto:privacy@glambooking.co.uk" className="text-primary hover:underline">
                  privacy@glambooking.co.uk
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
