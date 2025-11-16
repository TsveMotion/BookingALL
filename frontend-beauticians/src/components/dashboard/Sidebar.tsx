'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  Calendar,
  Users,
  Scissors,
  MapPin,
  UserCog,
  BarChart3,
  Globe,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Funnel', href: '/dashboard/funnel', icon: Zap },
  { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Services', href: '/dashboard/services', icon: Scissors },
  { name: 'Locations', href: '/dashboard/locations', icon: MapPin },
  { name: 'Staff', href: '/dashboard/staff', icon: UserCog },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Booking Page', href: '/dashboard/booking-page', icon: Globe },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const root = document.querySelector('.dashboard-root');
    if (root) {
      if (collapsed) {
        root.classList.add('sidebar-collapsed');
      } else {
        root.classList.remove('sidebar-collapsed');
      }
    }
  }, [collapsed]);

  return (
    <aside className="dashboard-sidebar flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 flex-shrink-0">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.png"
              alt="GlamBooking"
              width={140}
              height={45}
              className="h-8 w-auto"
              priority
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all group ${
                isActive
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-gray-600 group-hover:text-black'
                }`}
              />
              {!collapsed && (
                <span
                  className={`font-medium text-sm ${
                    isActive ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-100 p-4">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-900"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}
        {collapsed && (
          <button
            onClick={logout}
            className="mt-3 w-full flex items-center justify-center p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-700" />
          </button>
        )}
      </div>
    </aside>
  );
}
