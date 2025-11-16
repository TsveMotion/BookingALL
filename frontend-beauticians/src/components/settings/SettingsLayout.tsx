'use client';

import { useState } from 'react';
import { User, Building2, Bell, CreditCard, MapPin, Users, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Tab {
  id: string;
  label: string;
  icon: any;
  proOnly?: boolean;
}

const tabs: Tab[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'wordpress', label: 'WordPress Integration', icon: Globe, proOnly: true },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function SettingsLayout({ children, activeTab, onTabChange }: SettingsLayoutProps) {
  const { user } = useAuth();
  const isPro = (user as any)?.business?.plan === 'PRO' || (user as any)?.business?.plan === 'ENTERPRISE';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-black">Settings</h1>
          <p className="text-sm text-black/60 mt-1">Manage your account and business preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isLocked = tab.proOnly && !isPro;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isLocked && onTabChange(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                    transition-all duration-200
                    ${isActive 
                      ? 'text-black border-b-2 border-black' 
                      : 'text-black/50 hover:text-black/80 border-b-2 border-transparent'
                    }
                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.proOnly && !isPro && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-black text-white rounded">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}
