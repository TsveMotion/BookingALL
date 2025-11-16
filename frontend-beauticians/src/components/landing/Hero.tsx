import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 mb-6 w-fit">
              Trusted by 2,847+ Beauticians
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-black sm:text-6xl lg:text-7xl leading-tight">
              The #1 Booking Platform for Beauticians
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-xl">
              Manage facials, lashes, waxing, skincare, patch tests, appointments, payments and clients—all in one simple dashboard.
            </p>
            <div className="mt-10 flex items-center gap-4 flex-wrap">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-black px-8 py-4 text-base font-semibold text-white hover:bg-gray-800 transition-all shadow-sm"
              >
                Start Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button
                className="inline-flex items-center justify-center rounded-md border-2 border-black bg-transparent px-8 py-4 text-base font-semibold text-black hover:bg-black hover:text-white transition-all"
              >
                <Play className="mr-2 h-5 w-5" />
                See How It Works
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • Setup in 5 minutes • Cancel anytime
            </p>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="relative lg:pl-8">
            <div className="relative rounded-lg border-2 border-gray-900 bg-white shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center space-x-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                  <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                  <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                </div>
                <div className="flex-1 text-center">
                  <div className="inline-block rounded bg-gray-200 px-3 py-1 text-xs text-gray-600">
                    dashboard/services
                  </div>
                </div>
              </div>

              {/* Dashboard Content - Services List */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-black">Your Services</h3>
                  <div className="text-xs bg-black text-white px-3 py-1 rounded">+ Add Service</div>
                </div>

                {/* Service Items */}
                <div className="space-y-3">
                  {[
                    { name: 'Classic Lash Extensions', duration: '2h', price: '£85' },
                    { name: 'HIFU Facial Treatment', duration: '1h 30m', price: '£120' },
                    { name: 'Hollywood Wax', duration: '45m', price: '£35' },
                    { name: 'Dermaplaning', duration: '1h', price: '£65' },
                  ].map((service, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-black transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded bg-gray-100 border border-gray-200"></div>
                        <div>
                          <div className="text-sm font-semibold text-black">{service.name}</div>
                          <div className="text-xs text-gray-500">{service.duration}</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-black">{service.price}</div>
                    </div>
                  ))}
                </div>

                {/* Mini calendar preview */}
                <div className="border border-gray-200 rounded-lg p-4 mt-4">
                  <div className="text-xs font-semibold text-black mb-3">Today's Appointments</div>
                  <div className="space-y-2">
                    {['10:00 AM', '2:30 PM', '4:00 PM'].map((time, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-black"></div>
                        <div className="text-xs text-gray-600">{time}</div>
                        <div className="flex-1 h-2 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification badges */}
            <div className="absolute -right-4 top-8 bg-white border-2 border-black rounded-lg px-4 py-2 shadow-lg">
              <div className="text-xs text-gray-500">New booking</div>
              <div className="text-sm font-bold text-black">Lash Extensions</div>
            </div>
            <div className="absolute -left-4 bottom-8 bg-black border-2 border-black rounded-lg px-4 py-2 shadow-lg">
              <div className="text-xs text-gray-400">Payment received</div>
              <div className="text-lg font-bold text-white">£85</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
