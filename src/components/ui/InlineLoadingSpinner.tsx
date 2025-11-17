'use client'

import Image from 'next/image'

interface InlineLoadingSpinnerProps {
  size?: number
  className?: string
}

export default function InlineLoadingSpinner({ 
  size = 16,
  className = '' 
}: InlineLoadingSpinnerProps) {
  return (
    <span className={`inline-loading-spinner ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/home-icon.png"
        alt="Loading"
        width={size}
        height={size}
        className="inline-loading-logo"
      />
    </span>
  )
}