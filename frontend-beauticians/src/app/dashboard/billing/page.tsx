'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Check, Loader2, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';

interface Subscription {
  plan: string | null;
  active: boolean;
  subscriptionStatus: string;
  customerPortalUrl: string | null;
}

const plans = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      'Up to 50 bookings/month',
      '1 team member',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: 29,
    yearlyPrice: 290,
    interval: 'month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    features: [
      'Unlimited bookings',
      'Up to 3 team members',
      'Marketing funnel tools',
      'Advanced analytics',
      'Priority email support',
      'Custom booking page',
      'SMS reminders (500/month)',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 59,
    yearlyPrice: 590,
    interval: 'month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      'Everything in Starter',
      'Unlimited team members',
      'Abandoned booking recovery',
      'Advanced reports',
      '24/7 priority support',
      'SMS reminders (2000/month)',
      'Multiple locations',
      'API access',
    ],
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    void loadSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSubscription() {
    try {
      const response = await api.get('/payments/subscription');
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (planId === 'FREE') {
      toast.error('You are already on the Free plan');
      return;
    }

    setProcessingPlan(planId);
    try {
      // Create subscription checkout session
      const response = await api.post('/payments/subscription/create', {
        plan: planId.toLowerCase(),
        billingPeriod: 'monthly',
      });

      // Redirect to Stripe Checkout
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to start checkout';
      toast.error(message);
      console.error('Upgrade error:', error);
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await api.post('/payments/customer-portal');
      if (response.data.url) {
        window.open(response.data.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to open billing portal');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  const currentPlan = subscription?.plan?.toUpperCase() || 'FREE';
  const customerPortalUrl = subscription?.customerPortalUrl;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your subscription and billing details</p>
          </div>
          {subscription?.active && customerPortalUrl && (
            <a
              href={customerPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
            >
              <CreditCard className="w-4 h-4" />
              Manage Billing
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Current Plan */}
        {subscription && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium mb-1">Current Plan</p>
                <h2 className="text-2xl font-bold text-gray-900">{currentPlan}</h2>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                <div className={`w-2 h-2 rounded-full ${
                  subscription.active ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {subscription.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isUpgrade = plans.findIndex(p => p.id === currentPlan) < plans.findIndex(p => p.id === plan.id);
            const isProcessing = processingPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-6 transition-all ${
                  isCurrentPlan
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.id !== 'FREE' && !isCurrentPlan ? (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isProcessing}
                    className="w-full py-2 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `${isUpgrade ? 'Upgrade' : 'Switch'} to ${plan.name}`
                    )}
                  </button>
                ) : plan.id !== 'FREE' ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg font-semibold bg-purple-100 text-purple-700 cursor-default"
                  >
                    Current Plan
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Billing FAQ</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-900 mb-1">How do I cancel my subscription?</p>
              <p className="text-sm text-gray-600">
                Click "Manage Billing" above to access your subscription settings and cancel anytime.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">Can I upgrade or downgrade anytime?</p>
              <p className="text-sm text-gray-600">
                Yes! You can upgrade instantly. Downgrades take effect at the end of your current billing period.
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">What payment methods do you accept?</p>
              <p className="text-sm text-gray-600">
                We accept all major credit cards and debit cards via Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
