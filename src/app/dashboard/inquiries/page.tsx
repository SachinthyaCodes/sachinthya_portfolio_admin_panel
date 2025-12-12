'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaTrash, FaEnvelope, FaEnvelopeOpen, FaCheck } from 'react-icons/fa'
import { API_ENDPOINTS } from '@/lib/api'
import ConfirmModal from '@/components/ui/ConfirmModal'
import CustomLoadingSpinner from '@/components/ui/CustomLoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import './inquiries.css'

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
      const updatedInquiries = inquiries.map(inq => 
        inq.id === id ? { ...inq, status } : inq
      )
      setInquiries(updatedInquiries)
      
      // Update selected inquiry to reflect the change immediately
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status })
      }
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
      new: 'rgba(255, 255, 255, 0.7)',
      'in-progress': 'rgba(255, 255, 255, 0.5)',
      resolved: 'rgba(255, 255, 255, 0.4)',
    }
    const bgColors = {
      new: 'rgba(255, 255, 255, 0.08)',
      'in-progress': 'rgba(255, 255, 255, 0.05)',
      resolved: 'rgba(255, 255, 255, 0.03)',
    }
    return (
      <span
        style={{
          padding: '0.375rem 0.875rem',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '600',
          backgroundColor: bgColors[status],
          color: colors[status],
          textTransform: 'capitalize',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          letterSpacing: '0.3px',
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
      <div className="loading-container">
        <CustomLoadingSpinner />
      </div>
    )
  }

  return (
    <div className="inquiries-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Contact Inquiries</h1>
          <div className="inquiry-count">
            {inquiries.length} {inquiries.length === 1 ? 'Message' : 'Messages'}
          </div>
        </div>
        <div className="header-filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Messages</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="error-banner"
        >
          <p>⚠️ {error}</p>
          <button onClick={fetchInquiries} className="retry-btn">Retry</button>
        </motion.div>
      )}

      {/* Layout */}
      <div className="inquiries-layout">
        {/* Inquiries List Sidebar */}
        <div className="inquiries-sidebar">
          {inquiries.length === 0 ? (
            <EmptyState
              title="No inquiries found"
              description="When people contact you through the portfolio site, their messages will appear here."
            />
          ) : (
            <div className="inquiries-list">
              {inquiries.map((inquiry, index) => (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`inquiry-card ${
                    selectedInquiry?.id === inquiry.id ? 'active' : ''
                  } ${!inquiry.is_read ? 'unread' : ''}`}
                  onClick={() => viewInquiry(inquiry)}
                >
                  <div className="inquiry-card-header">
                    <div className="inquiry-name">
                      {!inquiry.is_read && <span className="unread-indicator" />}
                      {inquiry.name}
                    </div>
                    {getStatusBadge(inquiry.status)}
                  </div>
                  <div className="inquiry-subject">{inquiry.subject}</div>
                  <div className="inquiry-meta">
                    <span className="inquiry-email">{inquiry.email}</span>
                    <span className="inquiry-date">{formatDate(inquiry.created_at)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Detail View */}
        <AnimatePresence mode="wait">
          {selectedInquiry ? (
            <motion.div
              key={selectedInquiry.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="inquiry-detail"
            >
              <div className="detail-header">
                <div className="detail-title-section">
                  <div className="detail-name-row">
                    <h2 className="detail-name">{selectedInquiry.name}</h2>
                    {selectedInquiry.is_read ? (
                      <FaEnvelopeOpen className="read-icon" />
                    ) : (
                      <FaEnvelope className="unread-icon" />
                    )}
                  </div>
                  <a href={`mailto:${selectedInquiry.email}`} className="detail-email">
                    {selectedInquiry.email}
                  </a>
                </div>
                <button
                  onClick={() => openDeleteModal(selectedInquiry.id)}
                  className="delete-btn"
                  title="Delete inquiry"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="detail-meta-row">
                {getStatusBadge(selectedInquiry.status)}
                <span className="detail-timestamp">{formatDate(selectedInquiry.created_at)}</span>
              </div>

              <div className="detail-content">
                <div className="content-section">
                  <label className="section-label">Subject</label>
                  <p className="subject-text">{selectedInquiry.subject}</p>
                </div>

                <div className="content-section">
                  <label className="section-label">Message</label>
                  <div className="message-box">
                    {selectedInquiry.message}
                  </div>
                </div>
              </div>

              <div className="detail-actions">
                <label className="action-label">Update Status</label>
                <div className="status-selector">
                  {(['new', 'in-progress', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedInquiry.id, status)}
                      className={`status-btn ${selectedInquiry.status === status ? 'active' : ''}`}
                    >
                      {selectedInquiry.status === status && <FaCheck className="check-icon" />}
                      <span>{status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="no-selection"
            >
              <div className="no-selection-content">
                <FaEnvelope className="no-selection-icon" />
                <h3>Select an inquiry</h3>
                <p>Choose an inquiry from the list to view details</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Modal */}
      {selectedInquiry && (
        <div className="mobile-inquiry-modal">
          <div 
            className="mobile-modal-backdrop"
            onClick={() => setSelectedInquiry(null)}
          />
          <div className="mobile-modal-container">
            <div className="mobile-modal-header">
              <h3>{selectedInquiry.name}</h3>
              <button onClick={() => setSelectedInquiry(null)} className="mobile-close-btn">
                <FaTimes />
              </button>
            </div>
            
            <div className="mobile-modal-body">
              <div className="mobile-email">
                <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a>
              </div>
              
              <div className="mobile-meta">
                {getStatusBadge(selectedInquiry.status)}
                <span>{formatDate(selectedInquiry.created_at)}</span>
              </div>
              
              <div className="mobile-subject">
                <strong>Subject:</strong>
                <p>{selectedInquiry.subject}</p>
              </div>
              
              <div className="mobile-message">
                <strong>Message:</strong>
                <div className="mobile-message-text">{selectedInquiry.message}</div>
              </div>
              
              <div className="mobile-status-actions">
                {(['new', 'in-progress', 'resolved'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selectedInquiry.id, status)}
                    className={`mobile-status-btn ${selectedInquiry.status === status ? 'active' : ''}`}
                  >
                    {selectedInquiry.status === status && <FaCheck />}
                    {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => {
                  openDeleteModal(selectedInquiry.id)
                  setSelectedInquiry(null)
                }}
                className="mobile-delete-btn"
              >
                <FaTrash /> Delete Inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
