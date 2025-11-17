'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCharCount?: boolean
  maxLength?: number
  fullWidth?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ showCharCount = false, maxLength, fullWidth = true, className = '', value = '', ...props }, ref) => {
    const baseClasses = 'form-textarea'
    const widthClasses = fullWidth ? 'w-full' : ''
    
    const combinedClasses = `${baseClasses} ${widthClasses} ${className}`.trim()
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={combinedClasses}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        {showCharCount && (
          <div className="char-count">
            {charCount}{maxLength && `/${maxLength}`}
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea