'use client'

import { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  children: ReactNode
  helpText?: string
  className?: string
}

export default function FormField({ 
  label, 
  htmlFor, 
  required = false, 
  children, 
  helpText, 
  className = '' 
}: FormFieldProps) {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={htmlFor} className="form-label">
        {label} {required && '*'}
      </label>
      {children}
      {helpText && <small className="form-help">{helpText}</small>}
    </div>
  )
}