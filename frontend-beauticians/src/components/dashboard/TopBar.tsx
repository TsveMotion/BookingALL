'use client';

import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function TopBar() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Poll every 60 seconds instead of 30 to reduce API calls
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotifications() {
    try {
      const response = await api.get('/notifications');
      if (response?.data) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n: Notification) => !n.read).length);
      }
    } catch (error: any) {
      // Silently fail for now - notifications not critical
      if (error?.response?.status !== 429) {
        console.error('Failed to load notifications:', error);
      }
    }
  }

  async function markAllAsRead() {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  }

  return (
    <header className="dashboard-topbar flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <div className="text-sm text-gray-400 select-none">
          Search • Coming Soon
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-900" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-300 z-50">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-gray-600 hover:text-black transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-black rounded-full mt-1.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300">
          <div className="w-2 h-2 bg-black rounded-full" />
          <span className="text-sm font-medium text-gray-900">
            {user?.business?.name || 'My Business'}
          </span>
        </div>
      </div>
    </header>
  );
}
