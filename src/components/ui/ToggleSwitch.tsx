'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface ToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ label, description, className = '', ...props }, ref) => {
    return (
      <div className={`toggle-group ${className}`}>
        {label && <span className="toggle-label">{label}</span>}
        {description && <span className="toggle-description">{description}</span>}
        <label className="toggle-switch">
          <input
            ref={ref}
            type="checkbox"
            {...props}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    )
  }
)

ToggleSwitch.displayName = 'ToggleSwitch'

export default ToggleSwitch