'use client'

import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode | string
  title?: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`}>
      {icon && (
        <div className="empty-icon">
          {typeof icon === 'string' ? icon : icon}
        </div>
      )}
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}