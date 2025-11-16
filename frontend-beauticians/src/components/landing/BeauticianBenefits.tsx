import { Sparkles, Clock, Camera, FileText, Bell, Shield, Calendar, Users, Package } from 'lucide-react';

const benefits = [
  {
    name: 'Facial & Skincare Scheduling',
    description: 'Custom duration booking for treatments, consultations, and follow-ups.',
    icon: Sparkles,
  },
  {
    name: 'Lash Extension Workflow',
    description: 'Track infills, removal, and patch tests with automated reminders.',
    icon: Clock,
  },
  {
    name: 'Waxing & Brow Mapping',
    description: 'Organize waxing appointments with client preferences and skin sensitivities.',
    icon: Users,
  },
  {
    name: 'Custom Service Durations',
    description: 'Set flexible booking times for different treatments and service levels.',
    icon: Calendar,
  },
  {
    name: 'Add-ons & Bundles',
    description: 'Offer extras like LED masks, serums, or package deals during booking.',
    icon: Package,
  },
  {
    name: 'Patch Test Tracking',
    description: 'Never miss a 24-48hr patch test requirement with automatic alerts.',
    icon: Shield,
  },
  {
    name: 'Before/After Photo Logs',
    description: 'Document client progress with secure, organized photo galleries.',
    icon: Camera,
  },
  {
    name: 'Waiver & Consultation Forms',
    description: 'Digital consent forms collected and stored automatically per client.',
    icon: FileText,
  },
  {
    name: 'Aftercare Instructions',
    description: 'Send personalized treatment aftercare via SMS or email post-appointment.',
    icon: Bell,
  },
];

export default function BeauticianBenefits() {
  return (
    <section id="features" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-black sm:text-5xl">
            Built Specifically for Beauticians
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Every feature designed with beauty professionals in mind. No generic software—just what you need.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.name}
              className="group relative rounded-lg border border-gray-200 bg-white p-8 hover:border-black hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md border border-gray-900 bg-white mb-6">
                <benefit.icon className="h-6 w-6 text-black" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">
                {benefit.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
