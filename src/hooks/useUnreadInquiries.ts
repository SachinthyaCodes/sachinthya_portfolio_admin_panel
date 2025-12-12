import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '@/lib/api'

export function useUnreadInquiries() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('No token found for unread inquiries check')
          setLoading(false)
          return
        }

        const response = await fetch(`${API_ENDPOINTS.INQUIRIES.BASE}?is_read=false`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Unread inquiries count:', data.length)
          setUnreadCount(data.length)
        } else {
          console.error('Failed to fetch unread inquiries:', response.status)
        }
      } catch (error) {
        console.error('Error fetching unread inquiries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUnreadCount()

    // Poll for new inquiries every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [])

  console.log('useUnreadInquiries - Current count:', unreadCount)
  return { unreadCount, loading }
}
