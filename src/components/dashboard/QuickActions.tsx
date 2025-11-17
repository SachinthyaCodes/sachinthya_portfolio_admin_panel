import React from 'react'
import { FiPlus, FiEdit3, FiUpload, FiSettings } from 'react-icons/fi'

const quickActions = [
  {
    title: 'Add New Project',
    description: 'Create a new portfolio project',
    icon: <FiPlus />,
    href: '/dashboard/portfolio/new',
    color: 'primary'
  },
  {
    title: 'Edit Profile',
    description: 'Update your profile information',
    icon: <FiEdit3 />,
    href: '/dashboard/profile',
    color: 'secondary'
  },
  {
    title: 'Upload Media',
    description: 'Add images and files',
    icon: <FiUpload />,
    href: '/dashboard/media',
    color: 'success'
  },
  {
    title: 'Settings',
    description: 'Manage site configuration',
    icon: <FiSettings />,
    href: '/dashboard/settings',
    color: 'warning'
  }
]

export default function QuickActions() {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Quick Actions</h3>
        <p className="card-subtitle">Frequently used tasks</p>
      </div>
      <div className="card-content">
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className={`btn btn-${action.color} w-full justify-start`}
            >
              <span className="mr-3">{action.icon}</span>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs opacity-75">{action.description}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}