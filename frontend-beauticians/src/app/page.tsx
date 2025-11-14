'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Users, TrendingUp, Clock, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function BeauticiansLandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 via-purple-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold mb-6 animate-fade-in">
              💅 Built Specifically for Beauticians
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up">
              Grow Your Beauty
              <br />
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Business Effortlessly
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              The complete booking platform designed for beauty professionals. Manage appointments, track clients, 
              accept payments, and grow your beauty business—all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Free 14-Day Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>

          <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 aspect-video flex items-center justify-center">
              <div className="text-center p-8">
                <Sparkles className="w-20 h-20 text-primary mx-auto mb-4" />
                <p className="text-2xl font-semibold text-gray-700">Beautiful Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need as a Beautician
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to help you deliver exceptional beauty services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Smart Appointment Booking',
                description: 'Let clients book facials, waxing, makeup, and treatments 24/7 with real-time availability',
              },
              {
                icon: Users,
                title: 'Client Beauty Profiles',
                description: 'Track skin types, allergies, preferred treatments, and beauty history for personalized service',
              },
              {
                icon: Sparkles,
                title: 'Service Management',
                description: 'Organize your beauty treatments, packages, and add-ons with custom pricing and durations',
              },
              {
                icon: TrendingUp,
                title: 'Business Insights',
                description: 'Track your most popular treatments, peak booking times, and revenue to grow strategically',
              },
              {
                icon: Clock,
                title: 'Automated Reminders',
                description: 'Reduce no-shows with automatic SMS and email reminders for beauty appointments',
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Accept deposits and full payments online with secure payment processing',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-xl shadow-sm hover:shadow-md transition border border-pink-100"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect for All Beauty Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you specialize in one area or offer multiple treatments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              '💆 Facials',
              '💅 Manicures & Pedicures',
              '🧖 Waxing',
              '💄 Makeup',
              '👁️ Eyelash Extensions',
              '🧴 Skincare Treatments',
              '✨ Spray Tans',
              '🎨 Brow Services',
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg text-center shadow-sm hover:shadow-md transition"
              >
                <p className="text-lg font-medium text-gray-800">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Save Time, Increase Bookings
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Focus on what you do best—making your clients look and feel beautiful—while we handle the admin.
              </p>
              
              <div className="space-y-4">
                {[
                  'Reduce admin time by 70%',
                  'Increase bookings by 40% with 24/7 online booking',
                  'Decrease no-shows by 80% with automated reminders',
                  'Build client loyalty with personalized service tracking',
                  'Get paid faster with integrated payments',
                ].map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">💅</div>
                <p className="text-xl font-semibold text-gray-700">Growth Statistics Visual</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-gray-50" id="pricing">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Start free, upgrade as you grow. No hidden fees.
          </p>

          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-primary">
            <div className="text-sm font-semibold text-primary uppercase mb-2">Most Popular</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Pro Plan</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">£29</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8 text-left">
              {[
                'Unlimited bookings',
                'Client management',
                'Online payments',
                'Automated reminders',
                'Business analytics',
                'Custom branding',
                'Priority support',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/register">
              <Button size="lg" className="w-full">
                Start Free 14-Day Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Beauty Business?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join hundreds of beauticians who have streamlined their business with GlamBooking
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Start Your Free Trial Today
            </Button>
          </Link>
          <p className="text-pink-100 mt-4 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <span className="text-xl font-bold text-white">GlamBooking</span>
              </div>
              <p className="text-sm">For Beauticians</p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="/#pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Other Industries</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="http://localhost:3000" className="hover:text-white transition">Main Site</Link></li>
                <li><Link href="/hairdressers" className="hover:text-white transition">Hairdressers</Link></li>
                <li><Link href="/barbers" className="hover:text-white transition">Barbers</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            <p>© 2024 GlamBooking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
