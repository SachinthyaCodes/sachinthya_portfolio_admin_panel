'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'cancel' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false, 
    loading = false, 
    children, 
    className = '', 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'btn'
    
    const variantClasses = {
      primary: 'btn-primary',
      danger: 'btn-danger',
      cancel: 'btn-cancel',
      secondary: 'btn-secondary'
    }
    
    const sizeClasses = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3'
    }
    
    const widthClasses = fullWidth ? 'w-full' : ''
    
    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${className}`.trim()

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="loading-spinner w-4 h-4 mr-2"></div>
            Loading...
          </div>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button