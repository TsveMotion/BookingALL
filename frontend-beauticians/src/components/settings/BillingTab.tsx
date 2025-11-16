'use client';

import { useState } from 'react';
import { CreditCard, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function BillingTab() {
  const { user } = useAuth();
  const currentPlan = user?.subscription?.plan || 'FREE';

  const plans = [
    {
      name: 'Free',
      price: '£0',
      period: 'forever',
      features: [
        'Up to 50 bookings/month',
        '1 team member',
        'Basic analytics',
        'Email support',
      ],
      current: currentPlan === 'FREE',
    },
    {
      name: 'Starter',
      price: '£29',
      period: 'month',
      popular: true,
      features: [
        'Unlimited bookings',
        'Up to 3 team members',
        'Marketing funnel tools',
        'Advanced analytics',
        'Priority email support',
        'Custom booking page',
      ],
      current: currentPlan === 'STARTER',
    },
    {
      name: 'Pro',
      price: '£79',
      period: 'month',
      features: [
        'Everything in Starter',
        'Unlimited team members',
        'WordPress Integration',
        'Advanced reports',
        '24/7 priority support',
        'Multiple locations',
        'API access',
      ],
      current: currentPlan === 'PRO',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-black">{currentPlan}</p>
            <p className="text-sm text-black/60 mt-1">
              {currentPlan === 'FREE' ? 'Free forever' : `Billed monthly`}
            </p>
          </div>
          {currentPlan !== 'PRO' && (
            <Link
              href="#plans"
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-black/90 transition-colors text-sm font-medium"
            >
              Upgrade Plan
            </Link>
          )}
        </div>
      </div>

      {/* Available Plans */}
      <div id="plans">
        <h2 className="text-lg font-semibold text-black mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg p-6 ${
                plan.current
                  ? 'border-2 border-black'
                  : 'border border-black/10'
              }`}
            >
              {plan.popular && (
                <div className="inline-flex px-3 py-1 bg-black text-white text-xs font-bold rounded-full mb-3">
                  Most Popular
                </div>
              )}
              {plan.current && (
                <div className="inline-flex px-3 py-1 bg-black/10 text-black text-xs font-bold rounded-full mb-3">
                  Current Plan
                </div>
              )}
              <h3 className="text-xl font-bold text-black mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-black">{plan.price}</span>
                <span className="text-black/60">/{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-black flex-shrink-0 mt-0.5" />
                    <span className="text-black/80">{feature}</span>
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <button className="w-full px-4 py-2 border border-black rounded-md hover:bg-black hover:text-white transition-colors text-sm font-medium">
                  {currentPlan === 'FREE' ? 'Upgrade' : 'Switch Plan'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-black/60" />
          <h2 className="text-lg font-semibold text-black">Payment Method</h2>
        </div>
        {currentPlan === 'FREE' ? (
          <p className="text-sm text-black/60">No payment method required for free plan</p>
        ) : (
          <div className="flex items-center justify-between p-4 border border-black/10 rounded-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-black/10 rounded flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-black/60" />
              </div>
              <div>
                <p className="font-medium text-black">•••• •••• •••• 4242</p>
                <p className="text-xs text-black/60">Expires 12/25</p>
              </div>
            </div>
            <button className="text-sm text-black/60 hover:text-black underline">
              Update
            </button>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black mb-4">Billing History</h2>
        {currentPlan === 'FREE' ? (
          <p className="text-sm text-black/60">No billing history available</p>
        ) : (
          <div className="space-y-3">
            {[
              { date: 'Dec 1, 2024', amount: '£29.00', status: 'Paid' },
              { date: 'Nov 1, 2024', amount: '£29.00', status: 'Paid' },
              { date: 'Oct 1, 2024', amount: '£29.00', status: 'Paid' },
            ].map((invoice, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border border-black/10 rounded-md"
              >
                <div>
                  <p className="font-medium text-black">{invoice.date}</p>
                  <p className="text-sm text-black/60">{invoice.status}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-black">{invoice.amount}</p>
                  <button className="text-sm text-black/60 hover:text-black flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
