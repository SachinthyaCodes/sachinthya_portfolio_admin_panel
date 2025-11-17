import React from 'react'
import { FiClock, FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi'

const activities = [
  {
    id: 1,
    type: 'project',
    action: 'Created',
    target: 'E-commerce Analytics Dashboard',
    time: '2 hours ago',
    icon: <FiPlus className="text-green-500" />
  },
  {
    id: 2,
    type: 'testimonial',
    action: 'Updated',
    target: 'Sarah Chen testimonial',
    time: '4 hours ago',
    icon: <FiEdit className="text-blue-500" />
  },
  {
    id: 3,
    type: 'project',
    action: 'Published',
    target: 'Marketing Campaign Analysis',
    time: '1 day ago',
    icon: <FiEdit className="text-orange-500" />
  },
  {
    id: 4,
    type: 'media',
    action: 'Uploaded',
    target: '5 new project images',
    time: '2 days ago',
    icon: <FiPlus className="text-purple-500" />
  },
  {
    id: 5,
    type: 'project',
    action: 'Deleted',
    target: 'Old portfolio draft',
    time: '3 days ago',
    icon: <FiTrash2 className="text-red-500" />
  }
]

export default function RecentActivity() {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Activity</h3>
        <p className="card-subtitle">Your latest changes and updates</p>
      </div>
      <div className="card-content">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.action}</span>{' '}
                  <span className="text-gray-600">{activity.target}</span>
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <FiClock className="mr-1" />
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <a href="/dashboard/activity" className="text-sm text-blue-600 hover:text-blue-500">
            View all activity →
          </a>
        </div>
      </div>
    </div>
  )
}