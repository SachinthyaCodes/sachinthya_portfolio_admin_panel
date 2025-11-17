'use client'

import { FiBell, FiLogOut } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Header() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/login')
  }

  const handleHomeClick = () => {
    router.push('/dashboard')
  }

  return (
    <header className="header">
      <div className="header-left">
        {/* Modern Home Navigation Button */}
        <button 
          onClick={handleHomeClick}
          className="home-nav-button"
          title="Go to Dashboard"
        >
          <div className="home-icon-wrapper">
            <Image
              src="/home-icon.png"
              alt="Home"
              width={20}
              height={20}
              className="home-icon"
            />
          </div>
        </button>
      </div>

      <div className="header-right">
        <button className="btn btn-secondary">
          <FiBell />
        </button>
        
        <div className="user-menu">
          <button onClick={handleLogout} className="user-button">
            <div className="user-avatar">
              S
            </div>
            <span className="hidden md:block">Sachinthya</span>
            <FiLogOut className="ml-2" />
          </button>
        </div>
      </div>
    </header>
  )
}