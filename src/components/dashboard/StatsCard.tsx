import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  description: string
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  changeType,
  description
}: StatsCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${changeType}`}>
        {change} {description}
      </div>
    </div>
  )
}