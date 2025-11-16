'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700">
                By accessing and using GlamBooking, you agree to be bound by these Terms of Service and all
                applicable laws and regulations. If you do not agree with any of these terms, you are prohibited
                from using this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700">
                We grant you a personal, non-transferable, non-exclusive licence to use the GlamBooking platform
                on your devices in accordance with the terms of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Service Description</h2>
              <p className="text-gray-700 mb-4">GlamBooking provides:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Online booking and appointment management</li>
                <li>Client management tools</li>
                <li>Payment processing services</li>
                <li>Analytics and reporting features</li>
                <li>Marketing and communication tools</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscription and Billing</h2>
              <p className="text-gray-700 mb-4">
                Subscription fees are billed in advance on a monthly or yearly basis. All fees are non-refundable
                except as required by law or as explicitly stated in our refund policy.
              </p>
              <p className="text-gray-700">
                We offer a 30-day money-back guarantee for new customers. You may cancel your subscription at
                any time, and you will continue to have access until the end of your billing period.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not misuse the platform or attempt to gain unauthorized access</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Processing</h2>
              <p className="text-gray-700">
                All payments are processed through Stripe. We do not store your complete payment card details.
                By using our payment services, you agree to Stripe's terms and conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account immediately, without prior notice, for any breach of
                these Terms. Upon termination, your right to use the service will cease immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700">
                GlamBooking shall not be liable for any indirect, incidental, special, consequential or punitive
                damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. We will notify you of any changes by
                posting the new Terms of Service on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these Terms, please contact us at:{' '}
                <a href="mailto:legal@glambooking.co.uk" className="text-primary hover:underline">
                  legal@glambooking.co.uk
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
