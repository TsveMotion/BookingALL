'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Crown, Zap, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'Forever free',
    description: 'Perfect for getting started',
    icon: Zap,
    features: [
      'Up to 50 bookings/month',
      '1 team member',
      'Basic analytics',
      'Email support',
      'Custom booking page',
    ],
    cta: 'Start Free',
    popular: false,
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 59,
    period: 'per month',
    priceId: 'price_1SOMLtGutXTU3oixCgx223jF',
    description: 'For growing beauty businesses',
    icon: Crown,
    features: [
      'Unlimited bookings',
      'Unlimited team members',
      'Advanced analytics',
      '24/7 priority support',
      'Multiple locations',
      'API access',
      'WordPress integration',
      'Marketing funnel tools',
    ],
    cta: 'Start Pro',
    popular: true,
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    period: 'per month',
    priceId: 'price_1SOMNbGutXTU3oix9XshUkFE',
    description: 'For established multi-location businesses',
    icon: Sparkles,
    features: [
      'Everything in Pro',
      'Unlimited locations',
      'White-label branding',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Advanced reporting',
      'Priority features',
    ],
    cta: 'Contact Sales',
    popular: false,
    highlighted: false,
  },
];

export default function PlanSelectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string, priceId?: string) => {
    setLoading(planId);

    try {
      if (planId === 'free') {
        // Set plan to FREE and go to dashboard
        await api.patch('/business/plan', { plan: 'FREE' });
        toast.success('Free plan activated!');
        router.push('/dashboard');
      } else {
        // Create Stripe checkout session
        const response = await api.post('/payments/create-checkout', {
          priceId,
          planId,
        });

        if (response.data.url) {
          window.location.href = response.data.url;
        } else {
          toast.error('Failed to create checkout session');
        }
      }
    } catch (error: any) {
      console.error('Plan selection error:', error);
      toast.error(error.response?.data?.error || 'Failed to select plan');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Image 
            src="/logo.png" 
            alt="GlamBooking" 
            width={160} 
            height={40} 
            className="h-8 w-auto"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose your plan
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Start with our free plan or unlock advanced features
          </p>
          <p className="text-sm text-gray-500">
            All paid plans include a 14-day free trial • Cancel anytime
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${
                plan.popular
                  ? 'border-black shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-black text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    MOST POPULAR
                  </span>
                </div>
              )}


              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    £{plan.price}
                  </span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id, plan.priceId)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-lg font-semibold transition-colors mb-6 ${
                  plan.popular
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-white text-black border-2 border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.id ? 'Loading...' : plan.cta}
              </button>

              <div className="space-y-3 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why upgrade?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Unlimited Growth</h3>
              <p className="text-sm text-gray-600">
                Add unlimited staff and locations as your business expands
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Marketing Tools</h3>
              <p className="text-sm text-gray-600">
                Automated SMS reminders and marketing campaigns to fill your calendar
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Priority Support</h3>
              <p className="text-sm text-gray-600">
                Get help faster with priority email and chat support
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-white border border-gray-200 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I change plans later?
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                Yes! You can upgrade, downgrade, or cancel your plan at any time from your account settings.
              </p>
            </details>
            <details className="bg-white border border-gray-200 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What happens after the free trial?
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                After your 14-day trial, you'll be charged the plan rate. You can cancel before the trial ends with no charge.
              </p>
            </details>
            <details className="bg-white border border-gray-200 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Do you offer refunds?
              </summary>
              <p className="mt-2 text-sm text-gray-600">
                Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.
              </p>
            </details>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Questions? <Link href="mailto:support@glambooking.com" className="text-black underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
