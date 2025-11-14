'use client';

import { User, Building2, Bell, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export default function SettingsPage() {
  const settingsCards = [
    {
      title: 'Profile Settings',
      description: 'Manage your personal information, avatar, password and 2FA',
      icon: User,
      href: '/dashboard/settings/profile',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Business Settings',
      description: 'Update business details, branding, SEO and social links',
      icon: Building2,
      href: '/dashboard/settings/business',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Notifications',
      description: 'Configure your notification preferences and alerts',
      icon: Bell,
      href: '/dashboard/settings/notifications',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account and business preferences</p>
        </div>

        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
