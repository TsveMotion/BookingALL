'use client';

import { ArrowUpRight, Crown } from 'lucide-react';
import Link from 'next/link';

interface UpgradeBannerProps {
  feature: string;
  className?: string;
}

export default function UpgradeBanner({ feature, className = '' }: UpgradeBannerProps) {
  return (
    <div className={`bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 rounded-lg p-6 text-white ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Crown className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">Upgrade to Pro</h3>
          <p className="text-white/90 mb-4">
            {feature} is a Pro feature. Upgrade now to unlock this and many more powerful features.
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-all"
          >
            Upgrade Now
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
