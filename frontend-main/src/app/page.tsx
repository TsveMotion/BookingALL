import { Metadata } from 'next';
import Header from '@/components/home/Header';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Categories from '@/components/home/Categories';
import HowItHelps from '@/components/home/HowItHelps';
import Pricing from '@/components/home/Pricing';
import StripeSection from '@/components/home/StripeSection';
import FinalCTA from '@/components/home/FinalCTA';
import Footer from '@/components/home/Footer';

export const metadata: Metadata = {
  title: 'GlamBooking - All-in-One Booking Platform for Beauty Professionals',
  description: 'Grow your beauty business effortlessly with smart appointment booking, client management, automated reminders, and secure Stripe payments. Built for beauticians, hairdressers, and wellness professionals.',
  keywords: 'beauty booking software, salon booking system, appointment scheduling, beautician software, hair salon booking, stripe payments, client management',
  openGraph: {
    title: 'GlamBooking - Transform Your Beauty Business',
    description: 'All-in-one booking, payments, and client management for beauty professionals.',
    type: 'website',
    url: 'https://glambooking.co.uk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlamBooking - Beauty Business Platform',
    description: 'Smart booking, payments, and client management for beauty professionals.',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <Features />
      <Categories />
      <HowItHelps />
      <Pricing />
      <StripeSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
