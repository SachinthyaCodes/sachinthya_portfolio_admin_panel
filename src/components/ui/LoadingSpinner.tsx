'use client'

import CustomLoadingSpinner from './CustomLoadingSpinner'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) {
  // Redirect to CustomLoadingSpinner for consistent branding
  return <CustomLoadingSpinner message={message} size={size} className={className} />
}