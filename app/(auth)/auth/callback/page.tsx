'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'
import {useAuth} from '@/hooks/useAuth';

export default function AuthCallback() {
  const router = useRouter();
  const {isAuthenticated} = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (isAuthenticated) {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return <div>Processing authentication...</div>;
}

