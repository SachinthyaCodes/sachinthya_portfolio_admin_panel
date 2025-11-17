'use client'

import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, fullWidth = true, className = '', ...props }, ref) => {
    const baseClasses = 'form-select'
    const widthClasses = fullWidth ? 'w-full' : ''
    
    const combinedClasses = `${baseClasses} ${widthClasses} ${className}`.trim()

    return (
      <select
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }
)

Select.displayName = 'Select'

export default Select