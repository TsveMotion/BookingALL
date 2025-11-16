export default function DemoStrip() {
  return (
    <section className="bg-black py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            See How It Works
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            From booking to payment—beautifully simple.
          </p>
        </div>

        {/* Horizontal showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Booking Flow */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Step 1</div>
            <h3 className="text-lg font-bold text-black mb-4">Client Books</h3>
            <div className="space-y-2 mb-4">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              <div className="h-3 bg-gray-200 rounded w-3/5"></div>
            </div>
            <div className="border-2 border-black rounded p-3 bg-gray-50">
              <div className="text-xs text-gray-600 mb-1">Selected Service</div>
              <div className="text-sm font-bold text-black">Classic Lash Extensions</div>
              <div className="text-xs text-gray-500 mt-1">2h • £85</div>
            </div>
          </div>

          {/* Client Profile */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Step 2</div>
            <h3 className="text-lg font-bold text-black mb-4">Client Profile</h3>
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 border-2 border-gray-300"></div>
              <div>
                <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Last visit:</span>
                <span className="text-black font-medium">2 weeks ago</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Patch test:</span>
                <span className="text-green-600 font-medium">Valid</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Total spent:</span>
                <span className="text-black font-medium">£340</span>
              </div>
            </div>
          </div>

          {/* Treatment Notes */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Step 3</div>
            <h3 className="text-lg font-bold text-black mb-4">Treatment Notes</h3>
            <div className="border border-gray-200 rounded p-3 mb-3">
              <div className="text-xs text-gray-600 mb-2">Preferences</div>
              <div className="space-y-1">
                <div className="text-xs text-black">✓ Natural look</div>
                <div className="text-xs text-black">✓ Sensitive skin</div>
              </div>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <div className="text-xs text-gray-600 mb-2">Add-ons</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-black">LED Therapy</span>
                <span className="text-xs font-bold text-black">+£15</span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Step 4</div>
            <h3 className="text-lg font-bold text-black mb-4">Secure Payment</h3>
            <div className="bg-gray-50 border-2 border-black rounded p-4 mb-3">
              <div className="text-xs text-gray-600 mb-2">Total</div>
              <div className="text-3xl font-bold text-black mb-1">£100</div>
              <div className="text-xs text-gray-500">Service + Add-on</div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-12 border border-gray-300 rounded bg-white flex items-center justify-center text-xs font-bold">VISA</div>
              <div className="h-8 w-12 border border-gray-300 rounded bg-white flex items-center justify-center text-xs font-bold">MC</div>
              <div className="flex-1 text-xs text-gray-500 text-right">Powered by Stripe</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
