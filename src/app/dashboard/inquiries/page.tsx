'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'
import { API_ENDPOINTS } from '@/lib/api'
import { Button } from '@/components/ui'
import ConfirmModal from '@/components/ui/ConfirmModal'
import CustomLoadingSpinner from '@/components/ui/CustomLoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import styles from './inquiries.module.css'

interface Inquiry {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'in-progress' | 'resolved'
  is_read: boolean
  created_at: string
  updated_at: string
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRead, setFilterRead] = useState<string>('all')

  useEffect(() => {
    fetchInquiries()
  }, [filterStatus, filterRead])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Build query params
      const params = new URLSearchParams()
      if (filterStatus !== 'all') {
        params.append('status', filterStatus)
      }
      if (filterRead !== 'all') {
        params.append('is_read', filterRead)
      }

      const url = `${API_ENDPOINTS.INQUIRIES.BASE}${params.toString() ? `?${params.toString()}` : ''}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch inquiries')
      }

      const data = await response.json()
      setInquiries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.INQUIRIES.BY_ID(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_read: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark as read')
      }

      // Update local state
      setInquiries(inquiries.map(inq => 
        inq.id === id ? { ...inq, is_read: true } : inq
      ))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const updateStatus = async (id: string, status: Inquiry['status']) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.INQUIRIES.BY_ID(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // Update local state
      setInquiries(inquiries.map(inq => 
        inq.id === id ? { ...inq, status } : inq
      ))
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleDelete = async () => {
    if (!inquiryToDelete) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.INQUIRIES.BY_ID(inquiryToDelete), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete inquiry')
      }

      setInquiries(inquiries.filter(inq => inq.id !== inquiryToDelete))
      setDeleteModalOpen(false)
      setInquiryToDelete(null)
      if (selectedInquiry?.id === inquiryToDelete) {
        setSelectedInquiry(null)
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err)
      alert('Failed to delete inquiry')
    }
  }

  const openDeleteModal = (id: string) => {
    setInquiryToDelete(id)
    setDeleteModalOpen(true)
  }

  const viewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry)
    if (!inquiry.is_read) {
      markAsRead(inquiry.id)
    }
  }

  const getStatusBadge = (status: Inquiry['status']) => {
    const colors = {
      new: '#3b82f6',
      'in-progress': '#f59e0b',
      resolved: '#10b981',
    }
    return (
      <span
        style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: `${colors[status]}20`,
          color: colors[status],
          textTransform: 'capitalize',
        }}
      >
        {status === 'in-progress' ? 'In Progress' : status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CustomLoadingSpinner />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Contact Inquiries</h1>
        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Messages</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>Error: {error}</p>
          <Button onClick={fetchInquiries}>Retry</Button>
        </div>
      )}

      <div className={styles.layout}>
        <div className={styles.listSection}>
          {inquiries.length === 0 ? (
            <EmptyState
              title="No inquiries found"
              description="When people contact you through the portfolio site, their messages will appear here."
            />
          ) : (
            <div className={styles.inquiriesList}>
              {inquiries.map((inquiry) => (
                <motion.div
                  key={inquiry.id}
                  className={`${styles.inquiryCard} ${
                    selectedInquiry?.id === inquiry.id ? styles.selected : ''
                  } ${!inquiry.is_read ? styles.unread : ''}`}
                  onClick={() => viewInquiry(inquiry)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      {!inquiry.is_read && <span className={styles.unreadDot} />}
                      <h3>{inquiry.name}</h3>
                    </div>
                    {getStatusBadge(inquiry.status)}
                  </div>
                  <p className={styles.cardSubject}>{inquiry.subject}</p>
                  <p className={styles.cardEmail}>{inquiry.email}</p>
                  <p className={styles.cardDate}>{formatDate(inquiry.created_at)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {selectedInquiry && (
          <div className={styles.detailSection}>
            <div className={styles.detailHeader}>
              <div>
                <h2>{selectedInquiry.name}</h2>
                <p className={styles.detailEmail}>{selectedInquiry.email}</p>
              </div>
              <Button
                variant="danger"
                onClick={() => openDeleteModal(selectedInquiry.id)}
              >
                Delete
              </Button>
            </div>

            <div className={styles.detailMeta}>
              <span>{getStatusBadge(selectedInquiry.status)}</span>
              <span className={styles.detailDate}>
                {formatDate(selectedInquiry.created_at)}
              </span>
            </div>

            <div className={styles.detailSubject}>
              <strong>Subject:</strong> {selectedInquiry.subject}
            </div>

            <div className={styles.detailMessage}>
              <strong>Message:</strong>
              <p>{selectedInquiry.message}</p>
            </div>

            <div className={styles.detailActions}>
              <label htmlFor="status-select">Update Status:</label>
              <select
                id="status-select"
                value={selectedInquiry.status}
                onChange={(e) =>
                  updateStatus(selectedInquiry.id, e.target.value as Inquiry['status'])
                }
                className={styles.statusSelect}
              >
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry? This action cannot be undone."
      />
    </div>
  )
}
