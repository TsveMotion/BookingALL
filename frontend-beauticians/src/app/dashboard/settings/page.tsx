'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { User, Building2, Bell, CreditCard, MapPin, Users, Globe, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProfileTab from '@/components/settings/ProfileTab';
import BusinessTab from '@/components/settings/BusinessTab';
import NotificationsTab from '@/components/settings/NotificationsTab';
import BillingTab from '@/components/settings/BillingTab';
import LocationsTab from '@/components/settings/LocationsTab';
import StaffTab from '@/components/settings/StaffTab';
import WordPressIntegrationTab from '@/components/settings/WordPressIntegrationTab';

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
  { id: 'wordpress', label: 'WordPress', icon: Globe, proOnly: true },
];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  
  const isPro = (user as any)?.business?.plan === 'PRO' || (user as any)?.business?.plan === 'ENTERPRISE';

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'business':
        return <BusinessTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'billing':
        return <BillingTab />;
      case 'locations':
        return <LocationsTab />;
      case 'staff':
        return <StaffTab />;
      case 'wordpress':
        return <WordPressIntegrationTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account and business preferences</p>
        </div>

        {/* Side Navigation Tabs */}
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isLocked = tab.proOnly && !isPro;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isLocked && setActiveTab(tab.id)}
                  disabled={isLocked}
                  className={`
                    relative flex flex-col items-center justify-center gap-2 px-4 py-4
                    border-r border-b border-gray-200 last:border-r-0
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-black text-white'
                        : isLocked
                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
                    }
                  `}
                >
                  {isLocked && (
                    <Lock className="absolute top-2 right-2 w-3 h-3" />
                  )}
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium text-center">{tab.label}</span>
                  {tab.proOnly && !isPro && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 text-[10px] font-bold bg-black text-white rounded">
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
