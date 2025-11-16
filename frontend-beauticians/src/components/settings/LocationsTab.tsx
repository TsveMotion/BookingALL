'use client';

import { useState } from 'react';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';

export default function LocationsTab() {
  const [locations, setLocations] = useState([
    {
      id: 1,
      name: 'Main Studio',
      address: '123 High Street, London, SW1A 1AA',
      phone: '+44 20 1234 5678',
      isPrimary: true,
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black">Business Locations</h2>
          <p className="text-sm text-black/60 mt-1">Manage your business locations (PRO feature for multiple locations)</p>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-black/90 transition-colors text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Locations List */}
      <div className="space-y-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className="bg-white border border-black/10 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-black/60 mt-1" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-black">{location.name}</h3>
                    {location.isPrimary && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-black text-white rounded">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-black/60 mt-1">{location.address}</p>
                  <p className="text-sm text-black/60">{location.phone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-black/20 rounded-md hover:bg-black/5 transition-colors">
                  <Edit className="w-4 h-4 text-black/60" />
                </button>
                {!location.isPrimary && (
                  <button className="p-2 border border-black/20 rounded-md hover:bg-red-50 hover:border-red-200 transition-colors">
                    <Trash2 className="w-4 h-4 text-black/60" />
                  </button>
                )}
              </div>
            </div>

            {/* Location Details */}
            <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-black/10">
              <div>
                <label className="block text-xs font-medium text-black/60 mb-1">Opening Hours</label>
                <p className="text-sm text-black">Mon-Fri: 9:00 AM - 6:00 PM</p>
                <p className="text-sm text-black">Sat: 10:00 AM - 4:00 PM</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-black/60 mb-1">Services Available</label>
                <p className="text-sm text-black">All services</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PRO Feature Notice */}
      <div className="bg-black/5 border border-black/10 rounded-lg p-4">
        <p className="text-sm text-black/70">
          <strong>PRO Feature:</strong> Add multiple locations to manage different studios or service areas. 
          Upgrade to PRO to unlock multi-location management.
        </p>
      </div>
    </div>
  );
}
