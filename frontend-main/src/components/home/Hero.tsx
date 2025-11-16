import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl font-bold tracking-tight text-black sm:text-6xl lg:text-7xl leading-tight">
              Grow Your Beauty Business Effortlessly
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-xl">
              All-in-one booking, payments, client management and marketing—built for beauty professionals.
            </p>
            <div className="mt-10 flex items-center gap-4 flex-wrap">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-md bg-black px-8 py-4 text-base font-semibold text-white hover:bg-gray-800 transition-all shadow-sm"
              >
                Sign Up Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border-2 border-black bg-transparent px-8 py-4 text-base font-semibold text-black hover:bg-black hover:text-white transition-all"
              >
                Log In to Dashboard
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              No credit card required • Free forever plan • Cancel anytime
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
                    glambooking.co.uk/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Today's Bookings</div>
                    <div className="text-2xl font-bold text-black">12</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Revenue</div>
                    <div className="text-2xl font-bold text-black">£847</div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">Clients</div>
                    <div className="text-2xl font-bold text-black">124</div>
                  </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-black">Upcoming Appointments</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                          <div>
                            <div className="h-3 w-24 bg-gray-300 rounded mb-1"></div>
                            <div className="h-2 w-16 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {i === 1 ? '10:00 AM' : i === 2 ? '11:30 AM' : '2:00 PM'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart placeholder */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-end space-x-2 h-24">
                    {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-black rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -right-4 top-8 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-lg">
              <div className="text-xs text-gray-500">Payment received</div>
              <div className="text-lg font-bold text-black">+£65</div>
            </div>
            <div className="absolute -left-4 bottom-8 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-lg">
              <div className="text-xs text-gray-500">New booking</div>
              <div className="text-sm font-semibold text-black">Sarah J.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
    </section>
  );
}
