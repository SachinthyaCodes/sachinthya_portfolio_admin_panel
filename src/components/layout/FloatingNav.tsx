'use client'

import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { FiLogOut } from 'react-icons/fi'

const navItems = [
  { name: '', href: '/dashboard', isIcon: true }, // Home icon
  { name: 'work', href: '/dashboard/projects' },
  { name: 'testimonials', href: '/dashboard/testimonials' },
  { name: 'blog', href: '/dashboard/blog' },
  { name: 'inquiries', href: '/dashboard/inquiries' },
  { name: 'settings', href: '/dashboard/settings' },
]

export default function FloatingNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavClick = (href: string) => {
    router.push(href)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/login')
  }

  return (
    <nav className="floating-nav">
      <div className="floating-nav-container">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          
          return (
            <button
              key={index}
              onClick={() => handleNavClick(item.href)}
              className={`floating-nav-item ${isActive ? 'active' : ''} ${item.isIcon ? 'home-item' : ''}`}
              title={item.isIcon ? 'Dashboard' : item.name}
            >
              {item.isIcon ? (
                <div className="nav-home-icon-wrapper">
                  <Image
                    src="/home-icon.png"
                    alt="Home"
                    width={16}
                    height={16}
                    className="nav-home-icon"
                  />
                </div>
              ) : (
                <span className="floating-nav-text">{item.name}</span>
              )}
            </button>
          )
        })}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="floating-nav-item logout-item"
          title="Logout"
        >
          <FiLogOut className="logout-icon" />
        </button>
      </div>
    </nav>
  )
}