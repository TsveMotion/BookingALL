'use client';

import { useState } from 'react';
import { Users, Plus, Mail, Crown, Edit, Trash2 } from 'lucide-react';

export default function StaffTab() {
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: 'You',
      email: 'owner@example.com',
      role: 'Owner',
      status: 'Active',
      isOwner: true,
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black">Team Members</h2>
          <p className="text-sm text-black/60 mt-1">Manage your staff and their permissions</p>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-black/90 transition-colors text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Invite Team Member
        </button>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        {staff.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-black/10 rounded-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center text-lg font-semibold text-black">
                  {member.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-black">{member.name}</h3>
                    {member.isOwner && (
                      <Crown className="w-4 h-4 text-black/60" />
                    )}
                  </div>
                  <p className="text-sm text-black/60 flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-2 py-1 text-xs font-medium bg-black/5 text-black rounded">
                      {member.role}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>
              {!member.isOwner && (
                <div className="flex gap-2">
                  <button className="p-2 border border-black/20 rounded-md hover:bg-black/5 transition-colors">
                    <Edit className="w-4 h-4 text-black/60" />
                  </button>
                  <button className="p-2 border border-black/20 rounded-md hover:bg-red-50 hover:border-red-200 transition-colors">
                    <Trash2 className="w-4 h-4 text-black/60" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Staff Permissions */}
      <div className="bg-white border border-black/10 rounded-lg p-6">
        <h3 className="font-semibold text-black mb-4">Staff Permissions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-black/10 rounded-md">
            <div>
              <p className="font-medium text-black">Owner</p>
              <p className="text-sm text-black/60">Full access to all features</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border border-black/10 rounded-md">
            <div>
              <p className="font-medium text-black">Admin</p>
              <p className="text-sm text-black/60">Manage bookings, clients, and settings</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 border border-black/10 rounded-md">
            <div>
              <p className="font-medium text-black">Staff</p>
              <p className="text-sm text-black/60">View and manage own bookings only</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Limits */}
      <div className="bg-black/5 border border-black/10 rounded-lg p-4">
        <p className="text-sm text-black/70">
          <strong>Current Plan:</strong> Free plan allows 1 team member. Upgrade to Starter for up to 3 team members, or PRO for unlimited team members.
        </p>
      </div>
    </div>
  );
}
