'use client';

import { useState } from 'react';
import { Save, Bell, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function NotificationsTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailBookings: true,
    emailCancellations: true,
    emailReminders: true,
    smsBookings: false,
    smsCancellations: false,
    smsReminders: false,
    pushBookings: true,
    pushCancellations: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch('/users/notifications', settings);
      toast.success('Notification preferences updated');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-black' : 'bg-black/20'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-black/60" />
          <h2 className="text-lg font-semibold text-black">Email Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black">New Bookings</p>
              <p className="text-sm text-black/60">Receive email when a new booking is made</p>
            </div>
            <Toggle
              enabled={settings.emailBookings}
              onChange={() => setSettings({ ...settings, emailBookings: !settings.emailBookings })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black">Cancellations</p>
              <p className="text-sm text-black/60">Get notified when bookings are cancelled</p>
            </div>
            <Toggle
              enabled={settings.emailCancellations}
              onChange={() => setSettings({ ...settings, emailCancellations: !settings.emailCancellations })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black">Reminders</p>
              <p className="text-sm text-black/60">Daily summary of upcoming appointments</p>
            </div>
            <Toggle
              enabled={settings.emailReminders}
              onChange={() => setSettings({ ...settings, emailReminders: !settings.emailReminders })}
            />
          </div>
        </div>
      </div>

      {/* SMS Notifications (PRO) */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-5 h-5 text-black/60" />
          <h2 className="text-lg font-semibold text-black">SMS Notifications</h2>
          <span className="px-2 py-0.5 text-xs font-bold bg-black text-white rounded">PRO</span>
        </div>
        <div className="space-y-4 opacity-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black">New Bookings</p>
              <p className="text-sm text-black/60">Instant SMS alerts for new bookings</p>
            </div>
            <Toggle
              enabled={settings.smsBookings}
              onChange={() => setSettings({ ...settings, smsBookings: !settings.smsBookings })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black">Cancellations</p>
              <p className="text-sm text-black/60">SMS alerts for cancellations</p>
            </div>
            <Toggle
              enabled={settings.smsCancellations}
              onChange={() => setSettings({ ...settings, smsCancellations: !settings.smsCancellations })}
            />
          </div>
        </div>
        <p className="text-xs text-black/40 mt-4">Coming soon for PRO plan members</p>
      </div>

      {/* Push Notifications */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-black/60" />
          <h2 className="text-lg font-semibold text-black">Push Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black">New Bookings</p>
              <p className="text-sm text-black/60">Browser notifications for new bookings</p>
            </div>
            <Toggle
              enabled={settings.pushBookings}
              onChange={() => setSettings({ ...settings, pushBookings: !settings.pushBookings })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-black">Cancellations</p>
              <p className="text-sm text-black/60">Browser alerts for cancellations</p>
            </div>
            <Toggle
              enabled={settings.pushCancellations}
              onChange={() => setSettings({ ...settings, pushCancellations: !settings.pushCancellations })}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-black/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
