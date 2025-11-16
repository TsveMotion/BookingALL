'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function GoogleAuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken) {
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.replace('/dashboard');
      }, 500);
    } else {
      // No tokens, redirect to login
      setTimeout(() => {
        router.replace('/login?error=auth_failed');
      }, 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-black mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-sm text-gray-600">Please wait while we redirect you</p>
      </div>
    </div>
  );
}
