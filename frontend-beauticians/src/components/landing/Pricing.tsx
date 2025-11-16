import Link from 'next/link';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '£0',
    period: 'forever',
    description: 'Perfect for starting out',
    features: [
      '50 bookings/month',
      '1 team member',
      'Basic analytics',
      'Email support',
      'Mobile app access',
    ],
    cta: 'Start Now',
    href: '/register',
    featured: false,
  },
  {
    name: 'Starter',
    price: '£29',
    period: 'per month',
    description: 'For growing beauty businesses',
    features: [
      'Unlimited bookings',
      'Up to 3 team members',
      'Custom booking page',
      'Advanced analytics',
      'Marketing tools',
      'Priority email support',
      'SMS reminders',
      'Client management',
    ],
    cta: 'Start Now',
    href: '/register?plan=starter',
    featured: true,
  },
  {
    name: 'Pro',
    price: '£79',
    period: 'per month',
    description: 'For established salons',
    features: [
      'Everything in Starter',
      'Unlimited team members',
      'Multi-location support',
      'API access',
      'Abandoned booking recovery',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations',
    ],
    cta: 'Start Now',
    href: '/register?plan=pro',
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the plan that fits your business. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-lg bg-white p-8 shadow-sm ${
                plan.featured
                  ? 'border-2 border-black ring-1 ring-black'
                  : 'border border-gray-200'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex rounded-full bg-black px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-black">{plan.price}</span>
                  <span className="ml-2 text-gray-600">/{plan.period}</span>
                </div>
              </div>

              <Link
                href={plan.href}
                className={`block w-full rounded-md px-6 py-3 text-center text-base font-semibold transition-all mb-8 ${
                  plan.featured
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'border-2 border-black bg-white text-black hover:bg-black hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-black" aria-hidden="true" />
                    </div>
                    <span className="ml-3 text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            All plans include 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
