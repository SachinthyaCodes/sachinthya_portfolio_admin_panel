'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error'
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', fullWidth = true, className = '', ...props }, ref) => {
    const baseClasses = 'form-input'
    const variantClasses = {
      default: '',
      error: 'border-red-500 focus:border-red-500'
    }
    const widthClasses = fullWidth ? 'w-full' : ''
    
    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${widthClasses} ${className}`.trim()

    return (
      <input
        ref={ref}
        className={combinedClasses}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input