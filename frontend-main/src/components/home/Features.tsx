import { Calendar, Users, Briefcase, Bell, CreditCard, TrendingUp, Megaphone, Globe } from 'lucide-react';

const features = [
  {
    name: 'Smart Appointment Booking',
    description: '24/7 online booking with real-time availability. Clients book while you sleep.',
    icon: Calendar,
  },
  {
    name: 'Client Profiles',
    description: 'Complete client history, preferences, and notes at your fingertips.',
    icon: Users,
  },
  {
    name: 'Service Management',
    description: 'Organize treatments, pricing, and duration with flexible service catalogs.',
    icon: Briefcase,
  },
  {
    name: 'Automated Reminders',
    description: 'SMS & email reminders reduce no-shows by up to 80%.',
    icon: Bell,
  },
  {
    name: 'Secure Payments',
    description: 'Accept deposits and full payments instantly via Stripe integration.',
    icon: CreditCard,
  },
  {
    name: 'Business Insights',
    description: 'Real-time analytics, revenue tracking, and performance metrics.',
    icon: TrendingUp,
  },
  {
    name: 'Marketing Funnel Tools',
    description: 'Build landing pages, capture leads, and convert browsers to bookers.',
    icon: Megaphone,
  },
  {
    name: 'Custom Booking Page',
    description: 'Branded booking pages that match your business identity perfectly.',
    icon: Globe,
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            Everything You Need to Run Your Beauty Business
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Professional tools designed specifically for beauty professionals. No complexity, just results.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="group relative rounded-lg border border-gray-200 bg-white p-8 hover:border-black hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-md border border-gray-900 bg-white mb-6">
                  <feature.icon className="h-6 w-6 text-black" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {feature.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
