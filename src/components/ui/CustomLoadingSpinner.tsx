'use client'

import Image from 'next/image'

interface CustomLoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  fullScreen?: boolean
}

export default function CustomLoadingSpinner({ 
  message = 'Loading...', 
  size = 'md',
  className = '',
  fullScreen = false
}: CustomLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'size-sm',
    md: 'size-md', 
    lg: 'size-lg'
  }

  const logoSizes = {
    sm: { width: 16, height: 16 },
    md: { width: 20, height: 20 },
    lg: { width: 24, height: 24 }
  }

  const content = (
    <>
      <div className={`minimalist-loading-spinner ${sizeClasses[size]}`}>
        <Image
          src="/home-icon.png"
          alt="Loading"
          width={logoSizes[size].width}
          height={logoSizes[size].height}
          className="spinner-logo"
        />
      </div>
      {message && <p className="loading-message">{message}</p>}
    </>
  )

  if (fullScreen) {
    return (
      <div className="fullscreen-loading-overlay">
        <div className={`custom-loading-state ${className}`}>
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className={`custom-loading-state ${className}`}>
      {content}
    </div>
  )
}