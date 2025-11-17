'use client'

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
      <MinimalParticles />
      <main className="content-area-floating">
        {children}
      </main>
      <FloatingNav />
      <DraggableFloatingNav />
    </div>
  )
}