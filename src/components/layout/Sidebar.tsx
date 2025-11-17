'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FiHome, 
  FiFolder, 
  FiMessageSquare, 
  FiUser, 
  FiSettings,
  FiImage,
  FiBarChart,
  FiX
} from 'react-icons/fi'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: FiHome },
  { name: 'Portfolio', href: '/dashboard/portfolio', icon: FiFolder },
  { name: 'Testimonials', href: '/dashboard/testimonials', icon: FiMessageSquare },
  { name: 'Media', href: '/dashboard/media', icon: FiImage },
  { name: 'Analytics', href: '/dashboard/analytics', icon: FiBarChart },
  { name: 'Profile', href: '/dashboard/profile', icon: FiUser },
  { name: 'Settings', href: '/dashboard/settings', icon: FiSettings },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Mobile close button */}
        <div className="flex justify-end p-4 md:hidden">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <div className="sidebar-brand">
          <h1 className="brand-text">Portfolio Admin</h1>
          <p className="brand-subtitle">Content Management</p>
        </div>

        <nav className="nav-menu">
          <div className="nav-section">
            <h3 className="nav-section-title">Main</h3>
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => onClose()}
                >
                  <Icon className="icon" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}