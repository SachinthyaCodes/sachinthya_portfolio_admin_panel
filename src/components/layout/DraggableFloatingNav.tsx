'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { FiX } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface Position {
  x: number
  y: number
}

const navItems = [
  { name: 'work', href: '/dashboard/projects' },
  { name: 'testimonials', href: '/dashboard/testimonials' },
  { name: 'blog', href: '/dashboard/blog' },
  { name: 'inquiries', href: '/dashboard/inquiries' },
  { name: 'security', href: '/dashboard/security' },
  { name: 'settings', href: '/dashboard/settings' },
]

export default function DraggableFloatingNav() {
  const [position, setPosition] = useState<Position>({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  
  const buttonRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Handle mouse/touch events for dragging
  const handleStart = (clientX: number, clientY: number) => {
    if (!buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top
    })
    setIsDragging(true)
    setIsMenuOpen(false) // Close menu when starting to drag
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || typeof window === 'undefined') return
    
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const buttonSize = 56 // Size of the button
    
    let newX = clientX - dragOffset.x
    let newY = clientY - dragOffset.y
    
    // Keep button within viewport bounds
    newX = Math.max(0, Math.min(viewportWidth - buttonSize, newX))
    newY = Math.max(0, Math.min(viewportHeight - buttonSize, newY))
    
    setPosition({ x: newX, y: newY })
  }

  const handleEnd = () => {
    setIsDragging(false)
    
    if (typeof window === 'undefined') return
    
    // Snap to edges for better UX
    const viewportWidth = window.innerWidth
    const buttonSize = 56
    const threshold = viewportWidth / 3
    
    setPosition(prev => {
      if (prev.x < threshold) {
        return { ...prev, x: 20 } // Snap to left
      } else if (prev.x > viewportWidth - threshold) {
        return { ...prev, x: viewportWidth - buttonSize - 20 } // Snap to right
      }
      return prev
    })
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  // Add global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, dragOffset])

  // Handle click when not dragging
  const handleClick = () => {
    if (!isDragging) {
      setIsMenuOpen(!isMenuOpen)
    }
  }

  const handleNavClick = (href: string) => {
    router.push(href)
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/login')
    setIsMenuOpen(false)
  }

  // Calculate menu position to avoid viewport overflow
  const getMenuPosition = () => {
    if (typeof window === 'undefined') {
      return { x: position.x, y: position.y + 70 }
    }
    
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const menuWidth = 200
    const menuHeight = (navItems.length + 1) * 60 + 40 // Approximate height
    
    let menuX = position.x
    let menuY = position.y + 70 // Below the button
    
    // Adjust if menu would overflow right edge
    if (menuX + menuWidth > viewportWidth) {
      menuX = viewportWidth - menuWidth - 20
    }
    
    // Adjust if menu would overflow bottom edge
    if (menuY + menuHeight > viewportHeight) {
      menuY = position.y - menuHeight - 10 // Above the button
    }
    
    return { x: menuX, y: menuY }
  }

  const menuPosition = getMenuPosition()

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        ref={buttonRef}
        className="draggable-floating-button"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 9999,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        animate={{
          scale: isDragging ? 1.1 : 1,
          rotate: isMenuOpen ? 45 : 0
        }}
        transition={{ duration: 0.2 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="floating-button-content">
          {isMenuOpen ? (
            <FiX className="floating-button-icon" />
          ) : (
            <Image
              src="/home-icon.png"
              alt="Menu"
              width={22}
              height={22}
              className="floating-button-logo"
            />
          )}
        </div>
        
        {/* Ripple effect */}
        <div className="floating-button-ripple" />
      </motion.div>

      {/* Menu Options */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="floating-menu"
            style={{
              position: 'fixed',
              left: menuPosition.x,
              top: menuPosition.y,
              zIndex: 9998
            }}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="floating-menu-content">
              {/* Dashboard Home */}
              <motion.button
                className={`floating-menu-item ${pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('/dashboard')}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="menu-item-text">dashboard</span>
              </motion.button>

              {/* Navigation Items */}
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  className={`floating-menu-item ${pathname === item.href ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.href)}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="menu-item-text">{item.name}</span>
                </motion.button>
              ))}

              {/* Logout */}
              <motion.button
                className="floating-menu-item logout-item"
                onClick={handleLogout}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.05 }}
              >
                <span className="menu-item-text">logout</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="floating-menu-backdrop"
            style={{ zIndex: 9997 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}