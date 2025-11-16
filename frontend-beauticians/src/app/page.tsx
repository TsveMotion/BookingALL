import { Metadata } from 'next';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import BeauticianBenefits from '@/components/landing/BeauticianBenefits';
import WhyBeauticiansChoose from '@/components/landing/WhyBeauticiansChoose';
import DemoStrip from '@/components/landing/DemoStrip';
import Pricing from '@/components/landing/Pricing';
import StripeSection from '@/components/landing/StripeSection';
import Testimonials from '@/components/landing/Testimonials';
import FinalCTA from '@/components/landing/FinalCTA';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Beauticians - GlamBooking | #1 Booking Platform for Beauty Professionals',
  description: 'Built for beauticians, lash techs, and skincare professionals. Manage facials, lashes, waxing, appointments, patch tests, payments, and clients in one simple dashboard.',
  keywords: 'beautician booking software, lash extension software, facial booking system, beauty salon software, patch test tracking, skincare appointments, aesthetician software',
  openGraph: {
    title: 'Beauticians - GlamBooking',
    description: 'The #1 booking platform built specifically for beauticians and beauty professionals.',
    type: 'website',
    url: 'https://beauticians.glambooking.co.uk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beauticians - GlamBooking',
    description: 'Manage facials, lashes, waxing, and beauty appointments effortlessly.',
  },
};

export default function BeauticiansLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <BeauticianBenefits />
      <WhyBeauticiansChoose />
      <DemoStrip />
      <Pricing />
      <StripeSection />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
