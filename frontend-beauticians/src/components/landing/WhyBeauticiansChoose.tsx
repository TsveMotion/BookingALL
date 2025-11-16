import { Check } from 'lucide-react';

const benefits = [
  'Reduce admin work',
  'Eliminate Instagram DM booking',
  'Reduce no-shows',
  'Build loyal clients faster',
  'Automate reminders',
  'Get paid upfront with deposits',
  'Stripe-secured payments',
];

const stats = [
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '2,847+', label: 'Beauticians Onboarded' },
  { value: '+40%', label: 'Increase in Repeat Bookings' },
];

export default function WhyBeauticiansChoose() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl mb-8">
              Why Beauticians Choose GlamBooking
            </h2>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-black bg-black">
                      <Check className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                  </div>
                  <p className="ml-4 text-lg text-gray-700">{benefit}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Stats Card */}
          <div className="relative">
            <div className="rounded-lg border-2 border-gray-900 bg-white p-12 shadow-xl">
              <div className="space-y-8">
                {stats.map((stat, index) => (
                  <div key={stat.label} className={index !== stats.length - 1 ? 'border-b border-gray-200 pb-8' : ''}>
                    <div className="text-5xl font-bold text-black mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -right-4 -top-4 h-24 w-24 border-2 border-gray-300 rounded-lg -z-10"></div>
            <div className="absolute -left-4 -bottom-4 h-24 w-24 border-2 border-gray-300 rounded-lg -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
