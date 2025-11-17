'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    if (token) {
      // Redirect to dashboard if already logged in
      router.replace('/dashboard')
    } else {
      // Redirect to login if not logged in
      router.replace('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p>Redirecting to admin panel...</p>
      </div>
    </div>
  )
}