'use client';

import { Clock } from 'lucide-react';

interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

interface OpeningHoursEditorProps {
  hours: OpeningHours | null;
  onChange: (hours: OpeningHours) => void;
}

const defaultDayHours: DayHours = {
  open: '09:00',
  close: '17:00',
  closed: false,
};

const defaultHours: OpeningHours = {
  monday: { ...defaultDayHours },
  tuesday: { ...defaultDayHours },
  wednesday: { ...defaultDayHours },
  thursday: { ...defaultDayHours },
  friday: { ...defaultDayHours },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '09:00', close: '17:00', closed: true },
};

export default function OpeningHoursEditor({ hours, onChange }: OpeningHoursEditorProps) {
  const currentHours = hours || defaultHours;

  const days: (keyof OpeningHours)[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const dayLabels: Record<keyof OpeningHours, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  const updateDay = (day: keyof OpeningHours, field: keyof DayHours, value: string | boolean) => {
    onChange({
      ...currentHours,
      [day]: {
        ...currentHours[day],
        [field]: value,
      },
    });
  };

  const copyToAll = (day: keyof OpeningHours) => {
    const template = currentHours[day];
    const newHours = { ...currentHours };
    days.forEach((d) => {
      if (d !== day) {
        newHours[d] = { ...template };
      }
    });
    onChange(newHours);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Opening Hours</h3>
      </div>

      {days.map((day) => (
        <div
          key={day}
          className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border ${
            currentHours[day].closed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
          }`}
        >
          {/* Day Name & Checkbox */}
          <div className="flex items-center gap-3 sm:w-40">
            <input
              type="checkbox"
              checked={!currentHours[day].closed}
              onChange={(e) => updateDay(day, 'closed', !e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className={`font-medium ${currentHours[day].closed ? 'text-gray-400' : 'text-gray-900'}`}>
              {dayLabels[day]}
            </span>
          </div>

          {/* Time Inputs */}
          {!currentHours[day].closed ? (
            <>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={currentHours[day].open}
                  onChange={(e) => updateDay(day, 'open', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="time"
                  value={currentHours[day].close}
                  onChange={(e) => updateDay(day, 'close', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Copy to All Button */}
              <button
                type="button"
                onClick={() => copyToAll(day)}
                className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
              >
                Copy to all
              </button>
            </>
          ) : (
            <div className="flex-1">
              <span className="text-sm text-gray-400 italic">Closed</span>
            </div>
          )}
        </div>
      ))}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            const newHours = { ...currentHours };
            days.forEach((day) => {
              newHours[day] = { ...defaultDayHours };
            });
            onChange(newHours);
          }}
          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Set Standard Hours (9-5)
        </button>
        <button
          type="button"
          onClick={() => {
            const newHours = { ...currentHours };
            ['saturday', 'sunday'].forEach((day) => {
              newHours[day as keyof OpeningHours] = { ...defaultDayHours, closed: true };
            });
            onChange(newHours);
          }}
          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Close Weekends
        </button>
        <button
          type="button"
          onClick={() => {
            const newHours = { ...currentHours };
            days.forEach((day) => {
              newHours[day] = { ...defaultDayHours, closed: false };
            });
            onChange(newHours);
          }}
          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Open 7 Days
        </button>
      </div>
    </div>
  );
}
