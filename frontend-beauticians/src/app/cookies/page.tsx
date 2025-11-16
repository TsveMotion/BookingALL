'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Cookie Policy
          </h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies</h2>
              <p className="text-gray-700">
                Cookies are small text files that are placed on your device when you visit our website. They help
                us provide you with a better experience by remembering your preferences and understanding how you
                use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
              <p className="text-gray-700 mb-4">We use cookies for several purposes:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Essential Cookies:</strong> Required for the operation of our website (e.g., authentication)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Performance Cookies:</strong> Improve the speed and performance of our service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Session Cookies</h3>
                <p className="text-gray-700">
                  These are temporary cookies that expire when you close your browser. They help us maintain your
                  session as you navigate through our platform.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Persistent Cookies</h3>
                <p className="text-gray-700">
                  These cookies remain on your device for a set period or until you delete them. They help us
                  remember your login details and preferences for future visits.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Third-Party Cookies</h3>
                <p className="text-gray-700">
                  We use services from trusted third parties (like Stripe for payments) that may set their own
                  cookies. These are governed by the respective third party's privacy policy.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Cookies</h2>
              <p className="text-gray-700 mb-4">
                You can control and manage cookies in various ways:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Most browsers allow you to refuse or accept cookies</li>
                <li>You can delete cookies that have already been set</li>
                <li>You can set your browser to notify you when cookies are being set</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Please note that disabling certain cookies may impact the functionality of our website and your
                ability to use certain features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie List</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cookie Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">token</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Authentication</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Session</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">refreshToken</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Maintain login session</td>
                      <td className="px-6 py-4 text-sm text-gray-700">7 days</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">_ga</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Google Analytics (if enabled)</td>
                      <td className="px-6 py-4 text-sm text-gray-700">2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time. We will notify you of any changes by posting
                the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about our use of cookies, please contact us at:{' '}
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
