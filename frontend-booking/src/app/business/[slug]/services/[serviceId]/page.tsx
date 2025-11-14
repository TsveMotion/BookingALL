'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDuration, formatDate, formatTime } from '@/lib/utils';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import toast from 'react-hot-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function ServiceBookingPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const serviceId = params.serviceId as string;

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Client form
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadService();
  }, [serviceId]);

  useEffect(() => {
    if (service) {
      loadTimeSlots();
    }
  }, [selectedDate, service]);

  async function loadService() {
    try {
      const response = await api.get(`/booking-page/public/${slug}`);
      const foundService = response.data.services.find((s: Service) => s.id === serviceId);
      if (foundService) {
        setService(foundService);
      } else {
        toast.error('Service not found');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load service:', error);
      toast.error('Failed to load service');
    } finally {
      setLoading(false);
    }
  }

  async function loadTimeSlots() {
    setLoadingSlots(true);
    try {
      const response = await api.get(`/booking-page/public/${slug}/availability`, {
        params: {
          serviceId,
          date: selectedDate.toISOString(),
        },
      });
      setTimeSlots(response.data.slots || []);
    } catch (error) {
      console.error('Failed to load time slots:', error);
      setTimeSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  const handleDateChange = (days: number) => {
    const newDate = addDays(selectedDate, days);
    if (newDate >= new Date()) {
      setSelectedDate(newDate);
      setSelectedTime(null);
    }
  };

  const handleContinue = () => {
    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }
    if (!clientName || !clientEmail) {
      toast.error('Please fill in your details');
      return;
    }

    // Navigate to checkout
    const bookingData = {
      serviceId,
      startTime: selectedTime,
      clientName,
      clientEmail,
      clientPhone,
      notes,
    };
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    router.push(`/business/${slug}/checkout`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const availableSlots = timeSlots.filter(slot => slot.available);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to services</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
          {service.description && (
            <p className="text-gray-600 mb-4">{service.description}</p>
          )}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(service.duration)}</span>
            </div>
            <div className="text-xl font-bold text-primary">
              {formatCurrency(service.price)}
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Date</h2>
          
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleDateChange(-1)}
              disabled={isSameDay(selectedDate, new Date())}
              className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{format(selectedDate, 'EEEE')}</p>
              <p className="text-sm text-gray-600">{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
            
            <button
              onClick={() => handleDateChange(1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Date Selection */}
          <div className="grid grid-cols-7 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const date = addDays(new Date(), day);
              const isSelected = isSameDay(date, selectedDate);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded-lg text-center transition ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-xs font-medium">{format(date, 'EEE')}</p>
                  <p className="text-lg font-bold">{format(date, 'd')}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Time</h2>
          
          {loadingSlots ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-primary animate-spin mx-auto"></div>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No available slots for this date</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`p-3 rounded-lg font-medium transition ${
                    selectedTime === slot.time
                      ? 'bg-primary text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  {formatTime(slot.time)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Client Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="+44 7700 900000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Any allergies, preferences, or special requirements..."
              />
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedTime || !clientName || !clientEmail}
          className="w-full px-6 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
