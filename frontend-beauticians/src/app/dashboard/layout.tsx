'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { AuthProvider } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <div className="dashboard-root min-h-screen bg-gray-50">
        <Sidebar />
        <TopBar />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
