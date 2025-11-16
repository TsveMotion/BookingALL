import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="relative bg-gradient-to-b from-gray-900 to-black py-24 sm:py-32 overflow-hidden">
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to Upgrade Your Beauty Business?
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Join 2,847+ beauticians who've already transformed how they work. Start your free trial today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-base font-semibold text-black hover:bg-gray-100 transition-all shadow-lg"
            >
              Start Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-md border-2 border-white bg-transparent px-8 py-4 text-base font-semibold text-white hover:bg-white hover:text-black transition-all"
            >
              Explore Features
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
    </section>
  );
}
