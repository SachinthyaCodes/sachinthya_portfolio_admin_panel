'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TwoFactorVerify from '@/components/auth/TwoFactorVerify';
import '../../styles/two-factor.css';

export default function TwoFactorPage() {
  const [tempToken, setTempToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get temp token from localStorage or URL params
    const token = localStorage.getItem('tempToken') || searchParams.get('token') || '';
    
    if (!token) {
      // No temp token, redirect to login
      router.push('/login');
      return;
    }
    
    setTempToken(token);
  }, [router, searchParams]);

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  const handleBack = () => {
    localStorage.removeItem('tempToken');
    router.push('/login');
  };

  if (!tempToken) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <TwoFactorVerify
      tempToken={tempToken}
      onSuccess={handleSuccess}
      onBack={handleBack}
    />
  );
}