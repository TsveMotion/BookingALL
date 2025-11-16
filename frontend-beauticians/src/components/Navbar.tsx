'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
        : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center group">
            <div className="relative h-10 transition-transform group-hover:scale-105 duration-300">
              <Image
                src="/logo.png"
                alt="GlamBooking Beauticians"
                width={140}
                height={45}
                className="object-contain h-10 w-auto"
                priority
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-primary transition-colors font-medium">
              Pricing
            </Link>
            <a 
              href={process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3000'}
              className="text-gray-700 hover:text-primary transition-colors font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Main Page
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold">Log In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg font-semibold">Signup Free</Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link href="/#features" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary transition-colors font-medium">
                Pricing
              </Link>
              <a 
                href={process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3000'}
                className="text-gray-700 hover:text-primary transition-colors font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Main Page
              </a>
              <div className="pt-4 flex flex-col space-y-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600">Signup Free</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
