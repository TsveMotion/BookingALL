'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Check, X, Crown, Sparkles, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const STRIPE_PRICES = {
  STARTER_MONTHLY: 'price_1SOMNbGutXTU3oix9XshUkFE',
  STARTER_YEARLY: 'price_1SOMOaGutXTU3oixNwn89Ezd',
  PRO_MONTHLY: 'price_1SOMLtGutXTU3oixCgx223jF',
  PRO_YEARLY: 'price_1SOMNCGutXTU3oixggb8YGgs',
  BUSINESS_MONTHLY: 'price_1SOMNbGutXTU3oix9XshUkFE',
  BUSINESS_YEARLY: 'price_1SOMOaGutXTU3oixNwn89Ezd',
};

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  badge?: string;
  badgeColor?: string;
  features: Array<{ text: string; included: boolean; comingSoon?: boolean }>;
  highlighted?: boolean;
  stripePriceIds?: {
    monthly: string;
    yearly: string;
  };
}

const plans: PricingPlan[] = [
  {
    id: 'FREE',
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
      { text: 'SMS reminders', included: false, comingSoon: true },
      { text: 'Marketing funnel tools', included: false },
    ],
  },
  {
    id: 'STARTER',
    name: 'Starter',
    monthlyPrice: 29,
    yearlyPrice: Math.round(29 * 12 * 0.8),
    description: 'For growing beauty businesses',
    badge: 'Most Popular',
    badgeColor: 'bg-black',
    highlighted: true,
    stripePriceIds: {
      monthly: STRIPE_PRICES.STARTER_MONTHLY,
      yearly: STRIPE_PRICES.STARTER_YEARLY,
    },
    features: [
      { text: 'Unlimited bookings', included: true },
      { text: 'Up to 3 team members', included: true },
      { text: 'Marketing funnel tools', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Custom booking page', included: true },
      { text: 'SMS reminders (500/month)', included: true, comingSoon: true },
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    monthlyPrice: 59,
    yearlyPrice: Math.round(59 * 12 * 0.8),
    description: 'For established beauty professionals',
    badge: 'Best Value',
    badgeColor: 'bg-gray-900',
    stripePriceIds: {
      monthly: STRIPE_PRICES.PRO_MONTHLY,
      yearly: STRIPE_PRICES.PRO_YEARLY,
    },
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Unlimited team members', included: true },
      { text: 'Advanced reports & insights', included: true },
      { text: '24/7 priority support', included: true },
      { text: 'SMS reminders (2000/month)', included: true, comingSoon: true },
      { text: 'Multiple locations', included: true },
      { text: 'API access', included: true },
    ],
  },
];

const faqs = [
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes! You can cancel your subscription at any time. Your service will continue until the end of your billing period.',
  },
  {
    question: 'How does the Free plan work?',
    answer: 'Our Free plan is completely free forever with no credit card required. You get up to 50 bookings per month. Upgrade anytime to unlock unlimited bookings and premium features.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any differences.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards including Visa, Mastercard, and American Express. Payments are processed securely through Stripe.',
  },
];

export default function BillingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [downgradeIssues, setDowngradeIssues] = useState<string[]>([]);
  const [cancelling, setCancelling] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    setLoading(false);
  }, [authLoading, user, router]);

  const currentPlan = (user as any)?.business?.plan?.toUpperCase() || 'FREE';

  const checkDowngradeEligibility = async () => {
    try {
      const issues: string[] = [];
      
      // Check team members (FREE allows only 1)
      const staffResponse = await api.get('/staff');
      const teamCount = staffResponse.data.length;
      if (teamCount > 1) {
        issues.push(`You have ${teamCount} team members. Free plan allows only 1 (owner only).`);
      }
      
      // Check locations (FREE allows only 1)
      const locationsResponse = await api.get('/locations');
      const locationCount = locationsResponse.data.length;
      if (locationCount > 1) {
        issues.push(`You have ${locationCount} locations. Free plan allows only 1 location.`);
      }
      
      // Check bookings this month (FREE allows max 50/month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const bookingsResponse = await api.get('/bookings', {
        params: {
          startDate: startOfMonth.toISOString(),
        },
      });
      const monthlyBookings = bookingsResponse.data.length;
      if (monthlyBookings > 50) {
        issues.push(`You have ${monthlyBookings} bookings this month. Free plan allows max 50 bookings/month.`);
      }
      
      if (issues.length > 0) {
        setDowngradeIssues(issues);
        setShowDowngradeWarning(true);
      } else {
        setShowCancelModal(true);
      }
    } catch (error: any) {
      console.error('Failed to check downgrade eligibility:', error);
      toast.error('Failed to verify downgrade eligibility');
    }
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (plan.id === 'FREE') {
      if (currentPlan === 'FREE') {
        toast.error('You are already on the Free plan');
        return;
      }
      await checkDowngradeEligibility();
      return;
    }

    if (plan.id === currentPlan) {
      toast.error(`You are already on the ${plan.name} plan`);
      return;
    }

    if (!plan.stripePriceIds) {
      toast.error('This plan is not available yet');
      return;
    }

    setLoadingPlan(plan.id);
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

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await api.post('/billing/cancel-subscription');
      toast.success('Subscription cancelled. You can continue using paid features until the end of your billing period.');
      setShowCancelModal(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await api.post('/billing/customer-portal');
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to open billing portal');
    }
  };

  const getDisplayPrice = (plan: PricingPlan) => {
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getOriginalYearlyPrice = (plan: PricingPlan) => {
    return plan.monthlyPrice * 12;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-black animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading billing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your plan and billing • Current plan: <span className="font-semibold">{currentPlan}</span>
          </p>
        </div>
        {currentPlan !== 'FREE' && (
          <button
            onClick={handleManageBilling}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-sm"
          >
            <CreditCard className="w-5 h-5" />
            <span>Manage Billing</span>
          </button>
        )}
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-xl border border-gray-300 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-1">Current Plan</p>
            <h2 className="text-3xl font-bold text-gray-900">{currentPlan}</h2>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-semibold text-green-700">Active</span>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex flex-col items-center gap-4 bg-white rounded-xl p-6 border border-gray-300">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-semibold text-gray-900">
          <Sparkles className="w-4 h-4 text-gray-600" />
          Choose Your Billing Cycle
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-semibold ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              Save 20%
            </span>
          )}
        </div>
      </div>

      {/* Plans Grid - COMPACT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const displayPrice = getDisplayPrice(plan);
          const originalYearlyPrice = getOriginalYearlyPrice(plan);

          return (
            <div
              key={plan.id}
              className={`relative rounded-lg p-6 transition-all ${
                plan.highlighted
                  ? 'bg-white border-2 border-black shadow-lg'
                  : 'bg-white border border-gray-300 shadow-sm hover:shadow-md'
              } ${
                isCurrentPlan ? 'ring-2 ring-black ring-offset-2' : ''
              }`}
            >
              {plan.badge && !isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${plan.badgeColor} shadow-md`}>
                    {plan.badge}
                  </div>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                    <Crown className="w-3 h-3" />
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-600 mb-3">{plan.description}</p>

                {billingCycle === 'yearly' && plan.monthlyPrice > 0 ? (
                  <div>
                    <div className="text-xs text-gray-500 line-through">
                      £{originalYearlyPrice}/year
                    </div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        £{displayPrice}
                      </span>
                      <span className="text-gray-600 text-sm">/year</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium mt-1">
                      Save £{originalYearlyPrice - displayPrice}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      £{displayPrice}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {plan.monthlyPrice === 0 ? '/forever' : '/month'}
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-4 min-h-[180px]">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-xs ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.text}
                      {feature.comingSoon && (
                        <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                          Coming Soon
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={loadingPlan !== null || isCurrentPlan}
                className={`w-full py-2.5 rounded-lg font-semibold transition-all text-sm ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.highlighted
                    ? 'bg-black text-white hover:bg-gray-800 shadow-md'
                    : 'bg-gray-900 text-white hover:bg-black'
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {loadingPlan === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : isCurrentPlan ? (
                  'Current Plan'
                ) : plan.id === 'FREE' ? (
                  'Downgrade to Free'
                ) : (
                  `${plans.findIndex(p => p.id === currentPlan) < plans.findIndex(p => p.id === plan.id) ? 'Upgrade' : 'Switch'} to ${plan.name}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Features Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">SMS Reminders Coming Soon!</h3>
            <p className="text-sm text-gray-700">
              We're working hard to bring you automated SMS reminders for your clients. This feature will be available in Starter and Pro plans soon. Stay tuned!
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl border border-gray-300 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-4 py-3 text-left flex items-center justify-between gap-4 hover:bg-gray-100 transition"
              >
                <span className="font-semibold text-gray-900 text-sm">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                    openFaq === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-3 text-sm text-gray-600">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Downgrade Warning Modal */}
      {showDowngradeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cannot Downgrade Yet</h2>
              <p className="text-gray-600 mb-4">
                You need to resolve the following issues before downgrading to the Free plan:
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <ul className="space-y-2">
                  {downgradeIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDowngradeWarning(false)}
                className="flex-1 px-4 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancel Subscription?</h2>
              <p className="text-gray-600">
                You'll lose access to all premium features at the end of your billing period. Are you sure you want to downgrade to the Free plan?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep My Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
