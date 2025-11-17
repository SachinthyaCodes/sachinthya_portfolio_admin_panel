'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TwoFactorVerify from '@/components/auth/TwoFactorVerify';
import CustomLoadingSpinner from '@/components/ui/CustomLoadingSpinner';
import '../../styles/two-factor.css';

function TwoFactorContent() {
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
      <CustomLoadingSpinner message="Loading..." fullScreen={true} />
    )
  }

  return (
    <TwoFactorVerify
      tempToken={tempToken}
      onSuccess={handleSuccess}
      onBack={handleBack}
    />
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={
      <CustomLoadingSpinner message="Loading..." fullScreen={true} />
    }>
      <TwoFactorContent />
    </Suspense>
  )
}