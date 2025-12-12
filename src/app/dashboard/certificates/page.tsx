'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaTimes, FaPlus, FaExternalLinkAlt } from 'react-icons/fa'
import { API_ENDPOINTS } from '@/lib/api'
import CertificateForm from '@/components/certificates/CertificateForm'
import { CustomLoadingSpinner, EmptyState, ConfirmModal } from '@/components/ui'
import { toast } from 'react-hot-toast'
import './certificates.css'

interface Certificate {
  id: string
  provider: string
  title: string
  link?: string
  issuedDate: string
   credentialType: 'badge' | 'certification'
  orderIndex: number
  isShown: boolean
  createdAt: string
  updatedAt: string
}

export default function CertificatesPage() {
  const router = useRouter()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; certificate: Certificate | null }>({
    show: false,
    certificate: null,
  })
  
  // Mobile modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(API_ENDPOINTS.CERTIFICATES.BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch certificates')
      }

      const data = await response.json()
      setCertificates(data)
    } catch (error) {
      console.error('Error fetching certificates:', error)
      toast.error('Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCertificate = async (formData: FormData) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return false
      }

      const response = await fetch(API_ENDPOINTS.CERTIFICATES.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create certificate')
      }

      const newCertificate = await response.json()
      setCertificates(prev => [...prev, newCertificate])
      setEditingCertificate(newCertificate)
      toast.success('Certificate created successfully')
      setShowCreateModal(false)
      return true
    } catch (error) {
      console.error('Error creating certificate:', error)
      toast.error('Failed to create certificate')
      return false
    }
  }

  const handleEditCertificate = async (formData: FormData) => {
    if (!editingCertificate) return false

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return false
      }

      const response = await fetch(API_ENDPOINTS.CERTIFICATES.BY_ID(editingCertificate.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update certificate')
      }

      const updatedCertificate = await response.json()
      setCertificates(prev =>
        prev.map(cert => (cert.id === updatedCertificate.id ? updatedCertificate : cert))
      )
      setEditingCertificate(updatedCertificate)
      toast.success('Certificate updated successfully')
      setShowEditModal(false)
      return true
    } catch (error) {
      console.error('Error updating certificate:', error)
      toast.error('Failed to update certificate')
      return false
    }
  }

  const handleDeleteCertificateFromForm = (id: string) => {
    const certificate = certificates.find(c => c.id === id)
    if (certificate) {
      setDeleteModal({ show: true, certificate })
    }
  }

  const handleDeleteCertificate = async () => {
    if (!deleteModal.certificate) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(API_ENDPOINTS.CERTIFICATES.BY_ID(deleteModal.certificate.id), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete certificate')
      }

      setCertificates(prev => prev.filter(cert => cert.id !== deleteModal.certificate!.id))
      
      if (editingCertificate?.id === deleteModal.certificate.id) {
        setEditingCertificate(null)
      }

      toast.success('Certificate deleted successfully')
      setDeleteModal({ show: false, certificate: null })
      setShowEditModal(false)
    } catch (error) {
      console.error('Error deleting certificate:', error)
      toast.error('Failed to delete certificate')
    }
  }

  const handleToggleVisibility = async (certificate: Certificate) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(API_ENDPOINTS.CERTIFICATES.TOGGLE_VISIBILITY(certificate.id), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to toggle visibility')
      }

      const { isShown } = await response.json()
      
      setCertificates(prev =>
        prev.map(cert =>
          cert.id === certificate.id ? { ...cert, isShown } : cert
        )
      )

      if (editingCertificate?.id === certificate.id) {
        setEditingCertificate(prev => prev ? { ...prev, isShown } : null)
      }

      toast.success(`Certificate ${isShown ? 'shown' : 'hidden'}`)
    } catch (error) {
      console.error('Error toggling visibility:', error)
      toast.error('Failed to toggle visibility')
    }
  }

  const handleCertificateClick = (certificate: Certificate) => {
    // Mobile: Show edit modal
    if (window.innerWidth < 768) {
      setEditingCertificate(certificate)
      setShowEditModal(true)
      setShowCreateModal(false)
    } else {
      // Desktop: Show in sidebar
      setEditingCertificate(certificate)
    }
  }

  if (loading) {
    return <CustomLoadingSpinner message="Loading certificates..." fullScreen={true} />
  }

  return (
    <div className="projects-page-split">
      <div className="projects-layout">
        {/* Certificates List */}
        <div className="projects-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">All Certificates</h2>
            <span className="project-count">{certificates.length} certificates</span>
          </div>

          <div className="projects-list">
            {certificates.length === 0 ? (
              <EmptyState 
                icon="🎓"
                title="No certificates yet"
                description="Click the + button to add your first certificate"
              />
            ) : (
              certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className={`project-item ${
                    editingCertificate?.id === certificate.id ? 'active' : ''
                  } ${
                    !certificate.isShown ? 'hidden-project' : ''
                  }`}
                  onClick={() => handleCertificateClick(certificate)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="project-item-header">
                    <div className="project-item-info">
                      <div className="certificate-header">
                        <div>
                          <h3 className="project-item-name">{certificate.title}</h3>
                          <div className="certificate-meta">
                            <span className="project-item-category">{certificate.provider}</span>
                            <span className={`certificate-type-pill ${certificate.credentialType}`}>
                              {certificate.credentialType === 'badge' ? 'Badge' : 'Certification'}
                            </span>
                          </div>
                          <span className="certificate-date">
                            {new Date(certificate.issuedDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="project-item-status">
                      <label className="visibility-toggle" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={certificate.isShown}
                          onChange={() => handleToggleVisibility(certificate)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Desktop: Certificate Form Panel */}
        <div className="project-form-panel desktop-only">
          <div className="form-panel-header">
            <h2 className="form-panel-title">
              {editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}
            </h2>
            {editingCertificate && (
              <button
                onClick={() => setEditingCertificate(null)}
                className="form-panel-close"
                title="Cancel editing"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="form-panel-content">
            <CertificateForm
              certificate={editingCertificate}
              onSubmit={editingCertificate ? handleEditCertificate : handleCreateCertificate}
              onClose={() => setEditingCertificate(null)}
              onDelete={handleDeleteCertificateFromForm}
              isInline={true}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Floating Add Button */}
      <button 
        className="floating-add-btn mobile-only"
        onClick={() => setShowCreateModal(true)}
        title="Add New Certificate"
      >
        <FaPlus />
      </button>

      {/* Mobile: Create Certificate Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container project-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Certificate</h2>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content-form">
              <CertificateForm
                certificate={null}
                onSubmit={handleCreateCertificate}
                onClose={() => setShowCreateModal(false)}
                isInline={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Edit Certificate Modal */}
      {showEditModal && editingCertificate && (
        <div className="modal-overlay">
          <div className="modal-container project-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">Edit Certificate</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false)
                  setEditingCertificate(null)
                }} 
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content-form">
              <CertificateForm
                certificate={editingCertificate}
                onSubmit={async (data) => {
                  const success = await handleEditCertificate(data)
                  if (success) {
                    setShowEditModal(false)
                    setShowCreateModal(true)
                  }
                  return success
                }}
                onClose={() => {
                  setShowEditModal(false)
                  setEditingCertificate(null)
                }}
                onDelete={handleDeleteCertificateFromForm}
                isInline={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.show}
        title="Delete Certificate"
        message={`Are you sure you want to delete "${deleteModal.certificate?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteCertificate}
        onClose={() => setDeleteModal({ show: false, certificate: null })}
      />
    </div>
  )
}
