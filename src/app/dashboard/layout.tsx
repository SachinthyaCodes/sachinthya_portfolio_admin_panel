'use client'

import { Toaster } from 'react-hot-toast'
import FloatingNav from '@/components/layout/FloatingNav'
import DraggableFloatingNav from '@/components/layout/DraggableFloatingNav'
import MinimalParticles from '@/components/MinimalParticles/MinimalParticles'
import '@/components/layout/DraggableFloatingNav.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout-floating">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(26, 32, 44, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <MinimalParticles />
      <main className="content-area-floating">
        {children}
      </main>
      <FloatingNav />
      <DraggableFloatingNav />
    </div>
  )
}