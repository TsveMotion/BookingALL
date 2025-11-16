'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, X, Sparkles, TrendingUp, Crown, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STRIPE_PRICES = {
  // Starter plan uses BUSINESS Stripe IDs
  BUSINESS_MONTHLY: 'price_1SOMNbGutXTU3oix9XshUkFE',
  BUSINESS_YEARLY: 'price_1SOMOaGutXTU3oixNwn89Ezd',
  // Pro plan uses PRO Stripe IDs
  PRO_MONTHLY: 'price_1SOMLtGutXTU3oixCgx223jF',
  PRO_YEARLY: 'price_1SOMNCGutXTU3oixggb8YGgs',
};

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge?: string;
  badgeColor?: string;
  description: string;
  features: Array<{ text: string; included: boolean; comingSoon?: boolean }>;
  cta: string;
  highlighted?: boolean;
  stripePriceIds?: {
    monthly: string;
    yearly: string;
  };
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started',
    features: [
      { text: 'Up to 50 bookings/month', included: true },
      { text: '1 team member', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Custom booking page', included: false },
      { text: 'SMS reminders', included: false },
      { text: 'Marketing funnel tools', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: 29 * 12 * 0.8,
    badge: 'Most Popular',
    badgeColor: 'from-pink-500 to-purple-600',
    description: 'For growing beauty businesses',
    highlighted: true,
    stripePriceIds: {
      monthly: STRIPE_PRICES.BUSINESS_MONTHLY,
      yearly: STRIPE_PRICES.BUSINESS_YEARLY,
    },
    features: [
      { text: 'Unlimited bookings', included: true },
      { text: 'Up to 3 team members', included: true },
      { text: 'Marketing funnel tools', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Custom booking page', included: true },
      { text: 'SMS reminders (500/month)', included: true, comingSoon: true },
      { text: 'Multiple locations', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Signup Free',
  },
  {
    name: 'Pro',
    monthlyPrice: 59,
    yearlyPrice: 59 * 12 * 0.8,
    badge: 'Best Value',
    badgeColor: 'from-purple-600 to-pink-500',
    description: 'For established beauty professionals',
    stripePriceIds: {
      monthly: STRIPE_PRICES.PRO_MONTHLY,
      yearly: STRIPE_PRICES.PRO_YEARLY,
    },
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Abandoned booking recovery', included: true },
      { text: 'Advanced reports & insights', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'SMS reminders (2000/month)', included: true, comingSoon: true },
      { text: 'Multiple locations', included: true },
      { text: 'API access', included: true },
      { text: 'White-label options', included: true },
    ],
    cta: 'Signup Free',
  },
];

const faqs = [
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! You can cancel your subscription at any time with no questions asked. Your service will continue until the end of your billing period.',
  },
  {
    question: 'How does the Free plan work?',
    answer: 'Our Free plan is completely free forever with no credit card required. You get up to 50 bookings per month. Upgrade anytime to unlock unlimited bookings and premium features.',
  },
  {
    question: 'Do you charge commission on bookings?',
    answer: 'No! We never take a cut of your earnings. You keep 100% of what you make. We only charge the monthly subscription fee.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any differences.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards including Visa, Mastercard, and American Express. Payments are processed securely through Stripe.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees, no hidden charges. The price you see is the price you pay. We believe in transparent, honest pricing.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied within the first 30 days, we\'ll refund your payment in full.',
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleUpgrade = async (plan: PricingPlan) => {
    if (!user) {
      router.push('/register');
      return;
    }

    if (plan.name === 'Free') {
      toast.error('You are already on the Free plan');
      return;
    }

    if (!plan.stripePriceIds) {
      toast.error('This plan is not available yet');
      return;
    }

    setLoadingPlan(plan.name);
    try {
      const priceId = billingCycle === 'monthly' 
        ? plan.stripePriceIds.monthly 
        : plan.stripePriceIds.yearly;

      const response = await api.post('/billing/create-checkout-session', {
        priceId,
        planName: plan.name,
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  const getDisplayPrice = (plan: PricingPlan) => {
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
    return billingCycle === 'monthly' ? price : Math.round(price);
  };

  const getOriginalYearlyPrice = (plan: PricingPlan) => {
    return plan.monthlyPrice * 12;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-pink-50 via-purple-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold text-primary mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Start Free,
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Upgrade as You Grow
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            No hidden fees. No commission. Just powerful tools to help you build your beauty business.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                Save 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-primary shadow-2xl scale-105 md:scale-110'
                    : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${plan.badgeColor} shadow-lg`}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-2">
                    {billingCycle === 'yearly' && plan.monthlyPrice > 0 ? (
                      <div>
                        <div className="text-sm text-gray-500 line-through">
                          £{getOriginalYearlyPrice(plan)}/year
                        </div>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-5xl font-bold text-gray-900">
                            £{getDisplayPrice(plan)}
                          </span>
                          <span className="text-gray-600">/year</span>
                        </div>
                        <div className="text-sm text-green-600 font-medium mt-1">
                          Save £{getOriginalYearlyPrice(plan) - getDisplayPrice(plan)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold text-gray-900">
                          £{getDisplayPrice(plan)}
                        </span>
                        <span className="text-gray-600">
                          {plan.monthlyPrice === 0 ? '/forever' : '/month'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleUpgrade(plan)}
                  disabled={loadingPlan === plan.name}
                  className={`w-full mb-6 ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg'
                      : ''
                  }`}
                  size="lg"
                >
                  {loadingPlan === plan.name ? 'Loading...' : plan.cta}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.text}
                        {feature.comingSoon && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            Coming Soon
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Compare Plans</h2>
            <p className="text-xl text-gray-600">Find the perfect plan for your beauty business</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { feature: 'Bookings per month', free: '50', starter: 'Unlimited', pro: 'Unlimited' },
                    { feature: 'Team members', free: '1', starter: '3', pro: 'Unlimited' },
                    { feature: 'Custom booking page', free: false, starter: true, pro: true },
                    { feature: 'Marketing funnel tools', free: false, starter: true, pro: true },
                    { feature: 'Basic analytics', free: true, starter: true, pro: true },
                    { feature: 'Advanced analytics', free: false, starter: true, pro: true },
                    { feature: 'SMS reminders', free: false, starter: 'Coming soon', pro: 'Coming soon' },
                    { feature: 'Email support', free: true, starter: true, pro: true },
                    { feature: 'Priority support', free: false, starter: 'Email', pro: '24/7' },
                    { feature: 'Multiple locations', free: false, starter: false, pro: true },
                    { feature: 'API access', free: false, starter: false, pro: true },
                    { feature: 'White-label options', free: false, starter: false, pro: true },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {typeof row.free === 'boolean' ? (
                          row.free ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          row.free
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {typeof row.starter === 'boolean' ? (
                          row.starter ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          row.starter
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          row.pro
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about our pricing</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-pink-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Grow Your Beauty Business?
          </h2>
          <p className="text-xl text-pink-100 mb-8">
            Join thousands of beauticians who trust GlamBooking to manage their appointments and grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-xl">
                Signup Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="bg-white/10 text-white border-2 border-white hover:bg-white/20 backdrop-blur-sm">
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-pink-100 mt-6 text-sm">
            No credit card required • Start free forever • Upgrade anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
