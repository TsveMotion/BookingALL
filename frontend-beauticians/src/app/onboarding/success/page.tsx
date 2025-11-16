'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image 
            src="/logo.png" 
            alt="GlamBooking" 
            width={180} 
            height={45} 
            className="h-10 w-auto mx-auto"
          />
        </div>

        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            You're all set!
          </h1>
          <p className="text-gray-600">
            {plan ? `Your ${plan.replace('_', ' ')} plan is active` : 'Your account is ready'}
          </p>
        </div>

        {/* Features */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
          <h2 className="font-bold text-gray-900 mb-4 text-center">What's next?</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Set up your services</p>
                <p className="text-sm text-gray-600">Add the treatments you offer</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Invite your team</p>
                <p className="text-sm text-gray-600">Add staff members to your account</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Start accepting bookings</p>
                <p className="text-sm text-gray-600">Share your booking page with clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Redirecting automatically in 3 seconds...
        </p>
      </div>
    </div>
  );
}
