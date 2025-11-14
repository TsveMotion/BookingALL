'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Calendar, TrendingUp, Save, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SettingsSection from '@/components/settings/SettingsSection';
import UpgradeBanner from '@/components/UpgradeBanner';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function NotificationsSettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    bookingReminders: true,
    newClientAlerts: false,
    marketingUpdates: false,
    dailySummary: false,
    staffNotifications: false,
  });

  const isPro = user?.business?.plan === 'PRO' || user?.business?.plan === 'ENTERPRISE';

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const response = await api.get('/settings/business');
      if (response.data.notifications) {
        setNotifications({
          emailNotifications: response.data.notifications.emailNotifications ?? true,
          bookingReminders: response.data.notifications.bookingReminders ?? true,
          newClientAlerts: response.data.notifications.newClientAlerts ?? false,
          marketingUpdates: response.data.notifications.marketingUpdates ?? false,
          dailySummary: response.data.notifications.dailySummary ?? false,
          staffNotifications: response.data.notifications.staffNotifications ?? false,
        });
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/settings/business/notifications', notifications);
      toast.success('Notification preferences saved!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    // Check if Pro feature
    const proFeatures = ['dailySummary', 'staffNotifications', 'marketingUpdates'];
    if (!isPro && proFeatures.includes(key)) {
      toast.error('This is a Pro feature');
      return;
    }
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage how you receive notifications</p>
        </div>

        {/* Email Notifications */}
        <SettingsSection title="Email Notifications" description="Stay updated via email">
          <div className="space-y-4">
            {/* Booking Confirmations */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Booking Confirmations</p>
                  <p className="text-sm text-gray-600">Receive emails when new bookings are made</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.emailNotifications}
                  onChange={() => toggleNotification('emailNotifications')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Booking Reminders */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Booking Reminders</p>
                  <p className="text-sm text-gray-600">Get reminders for upcoming appointments</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.bookingReminders}
                  onChange={() => toggleNotification('bookingReminders')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* New Client Alerts */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">New Client Alerts</p>
                  <p className="text-sm text-gray-600">Be notified when new clients sign up</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notifications.newClientAlerts}
                  onChange={() => toggleNotification('newClientAlerts')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </SettingsSection>

        {/* Pro Features */}
        <SettingsSection title="Advanced Notifications" description="Pro-only notification features">
          {!isPro ? (
            <UpgradeBanner feature="Advanced notification features" />
          ) : (
            <div className="space-y-4">
              {/* Daily Summary */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Daily Summary</p>
                    <p className="text-sm text-gray-600">Receive daily business performance summaries</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.dailySummary}
                    onChange={() => toggleNotification('dailySummary')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Staff Notifications */}
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Staff Notifications</p>
                    <p className="text-sm text-gray-600">Notify staff about their assigned bookings</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.staffNotifications}
                    onChange={() => toggleNotification('staffNotifications')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Marketing Updates */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Marketing Updates</p>
                    <p className="text-sm text-gray-600">Receive tips, guides, and product updates</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications.marketingUpdates}
                    onChange={() => toggleNotification('marketingUpdates')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          )}
        </SettingsSection>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
