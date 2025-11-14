'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CreditCard, Calendar, Clock, User } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import api from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  async function loadCheckoutData() {
    try {
      const stored = localStorage.getItem('bookingData');
      if (!stored) {
        toast.error('No booking data found');
        router.back();
        return;
      }

      const data = JSON.parse(stored);
      setBookingData(data);

      // Load business and service details
      const response = await api.get(`/booking-page/public/${slug}`);
      setBusiness(response.data.business);
      const foundService = response.data.services.find((s: any) => s.id === data.serviceId);
      setService(foundService);
    } catch (error) {
      console.error('Failed to load checkout data:', error);
      toast.error('Failed to load booking details');
    }
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 1: Create booking first
      const bookingResponse = await api.post('/bookings/public/create', {
        businessSlug: slug,
        serviceId: bookingData.serviceId,
        startTime: bookingData.startTime,
        clientName: bookingData.clientName,
        clientEmail: bookingData.clientEmail,
        clientPhone: bookingData.clientPhone,
        notes: bookingData.notes,
        paymentMethod: 'card',
      });

      const bookingId = bookingResponse.data.id;

      // Step 2: Create Stripe checkout session
      const checkoutResponse = await api.post('/payments/checkout', {
        bookingId,
        businessSlug: slug,
      });

      const { sessionId } = checkoutResponse.data;

      // Step 3: Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe && sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          toast.error(error.message || 'Payment failed');
        }
      } else {
        toast.error('Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  const handleBookWithoutPayment = async () => {
    setLoading(true);
    try {
      const response = await api.post('/bookings/public/create', {
        businessSlug: slug,
        serviceId: bookingData.serviceId,
        startTime: bookingData.startTime,
        clientName: bookingData.clientName,
        clientEmail: bookingData.clientEmail,
        clientPhone: bookingData.clientPhone,
        notes: bookingData.notes,
        paymentMethod: 'cash',
      });

      localStorage.removeItem('bookingData');
      router.push(`/business/${slug}/success?bookingId=${response.data.id}`);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData || !service || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-primary animate-spin"></div>
      </div>
    );
  }

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
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Confirm Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Service Details</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="font-semibold text-gray-900">{service.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold text-gray-900">{formatDateTime(bookingData.startTime)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-semibold text-gray-900">{bookingData.clientName}</p>
                    <p className="text-sm text-gray-600">{bookingData.clientEmail}</p>
                    {bookingData.clientPhone && (
                      <p className="text-sm text-gray-600">{bookingData.clientPhone}</p>
                    )}
                  </div>
                </div>

                {bookingData.notes && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                    <p className="text-gray-900">{bookingData.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 border-2 border-primary rounded-xl hover:bg-primary/5 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Pay Online</p>
                      <p className="text-sm text-gray-600">Secure payment via Stripe</p>
                    </div>
                  </div>
                  <div className="text-primary font-bold">
                    {formatCurrency(service.price)}
                  </div>
                </button>

                <button
                  onClick={handleBookWithoutPayment}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Pay Later</p>
                    <p className="text-sm text-gray-600">Pay at the venue</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
              
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(service.price)}</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(service.price)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> You can cancel or reschedule up to 24 hours before your appointment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
