'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, Clock, Star, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              Transform Your Beauty
              <br />
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Business Today
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              The all-in-one booking platform for beauticians, hairdressers, barbers, and wellness professionals.
              Manage appointments, clients, and grow your business effortlessly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-sm text-gray-500 mt-4"
            >
              No credit card required • Free 14-day trial • Cancel anytime
            </motion.p>
          </div>

          {/* Hero Image/Screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
          >
            <div className="bg-gradient-to-br from-pink-100 to-purple-100 aspect-video flex items-center justify-center">
              <p className="text-2xl font-semibold text-gray-600">Dashboard Preview</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for beauty and wellness professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Smart Booking',
                description: 'Automated scheduling with real-time availability and instant confirmations',
              },
              {
                icon: Users,
                title: 'Client Management',
                description: 'Keep track of client history, preferences, and build lasting relationships',
              },
              {
                icon: TrendingUp,
                title: 'Business Analytics',
                description: 'Insightful reports and metrics to grow your revenue and optimize operations',
              },
              {
                icon: Clock,
                title: '24/7 Online Booking',
                description: 'Let clients book appointments anytime, anywhere from any device',
              },
              {
                icon: Star,
                title: 'Reviews & Ratings',
                description: 'Collect feedback and showcase your excellent service to attract new clients',
              },
              {
                icon: Shield,
                title: 'Secure & Reliable',
                description: 'Bank-level security with automatic backups and 99.9% uptime guarantee',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Your Industry
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored solutions for every beauty and wellness business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Beauticians', url: '/beauticians', emoji: '💅' },
              { name: 'Hairdressers', url: '/hairdressers', emoji: '💇' },
              { name: 'Barbers', url: '/barbers', emoji: '✂️' },
              { name: 'Spas & Wellness', url: '/spas', emoji: '🧖' },
            ].map((industry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={industry.url}
                  className="block p-8 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl hover:shadow-lg transition group"
                >
                  <div className="text-5xl mb-4">{industry.emoji}</div>
                  <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-primary transition">
                    {industry.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join thousands of beauty professionals who trust GlamBooking
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
