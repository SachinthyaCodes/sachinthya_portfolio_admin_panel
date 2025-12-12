'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaPlus } from 'react-icons/fa'
import toast from 'react-hot-toast'
import TestimonialForm from '@/components/testimonials/TestimonialForm'
import ConfirmModal from '@/components/ui/ConfirmModal'
import CustomLoadingSpinner from '@/components/ui/CustomLoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import './testimonials.css'

interface Testimonial {
  id: string
  name: string
  role: string
  text: string
  imageUrl?: string
  isShown: boolean
  orderIndex?: number
  createdAt?: Date
  updatedAt?: Date
}

// Map database fields to frontend
function mapDbToFrontend(dbTestimonial: Record<string, unknown>): Testimonial {
  return {
    id: dbTestimonial.id as string,
    name: dbTestimonial.name as string,
    role: dbTestimonial.role as string,
    text: dbTestimonial.text as string,
    imageUrl: dbTestimonial.image_url as string | undefined,
    isShown: (dbTestimonial.is_shown as boolean) ?? true,
    orderIndex: (dbTestimonial.order_index as number) || 0,
    createdAt: dbTestimonial.created_at ? new Date(dbTestimonial.created_at as string) : undefined,
    updatedAt: dbTestimonial.updated_at ? new Date(dbTestimonial.updated_at as string) : undefined,
  }
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; testimonial: Testimonial | null }>({
    show: false,
    testimonial: null,
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }
      
      const response = await fetch('/api/testimonials', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const mappedData = data.map(mapDbToFrontend)
        setTestimonials(mappedData)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTestimonial = async (testimonialData: FormData) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Authentication token not found. Please login again.')
        window.location.href = '/login'
        return false
      }

      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: testimonialData,
      })

      if (response.ok) {
        await fetchTestimonials()
        setShowCreateModal(false)
        toast.success('Testimonial created successfully!')
        return true
      }
      
      if (response.status === 401) {
        toast.error('Session expired. Please login again.')
        localStorage.removeItem('token')
        window.location.href = '/login'
        return false
      }

      const errorData = await response.json().catch(() => ({}))
      toast.error(errorData.error || 'Failed to create testimonial')
      return false
    } catch (error) {
      console.error('Error creating testimonial:', error)
      toast.error('Error creating testimonial')
      return false
    }
  }

  const handleEditTestimonial = async (testimonialData: FormData) => {
    if (!editingTestimonial) return false

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Authentication token not found. Please login again.')
        window.location.href = '/login'
        return false
      }

      const response = await fetch(`/api/testimonials/${editingTestimonial.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: testimonialData,
      })

      if (response.ok) {
        await fetchTestimonials()
        // Reset to "Add New Testimonial" mode after successful edit
        setEditingTestimonial(null)
        setShowEditModal(false)
        toast.success('Testimonial updated successfully!')
        return true
      }

      if (response.status === 401) {
        toast.error('Session expired. Please login again.')
        localStorage.removeItem('token')
        window.location.href = '/login'
        return false
      }

      const errorData = await response.json().catch(() => ({}))
      toast.error(errorData.error || 'Failed to update testimonial')
      return false
    } catch (error) {
      console.error('Error updating testimonial:', error)
      toast.error('Error updating testimonial')
      return false
    }
  }

  const handleDeleteTestimonial = async () => {
    if (!deleteModal.testimonial) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/testimonials/${deleteModal.testimonial.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchTestimonials()
        setDeleteModal({ show: false, testimonial: null })
        setEditingTestimonial(null) // Reset form if deleted testimonial was being edited
        toast.success('Testimonial deleted successfully!')
      } else {
        toast.error('Failed to delete testimonial')
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      toast.error('Error deleting testimonial')
    }
  }

  const handleToggleVisibility = async (testimonial: Testimonial) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/testimonials/${testimonial.id}/toggle-visibility`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchTestimonials()
        toast.success(testimonial.isShown ? 'Testimonial hidden' : 'Testimonial shown')
      } else {
        toast.error('Failed to toggle visibility')
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
      toast.error('Error toggling visibility')
    }
  }

  const handleDeleteTestimonialFromForm = async (testimonial: Testimonial) => {
    setDeleteModal({ show: true, testimonial })
    setShowEditModal(false)
  }

  const handleTestimonialClick = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    // On mobile, show modal; on desktop, form updates inline
    if (window.innerWidth < 1024) {
      setShowEditModal(true)
    }
  }

  if (loading) {
    return (
      <CustomLoadingSpinner message="Loading testimonials..." fullScreen={true} />
    )
  }

  return (
    <div className="projects-page-split">
      {/* Desktop: Two Column Layout, Mobile: Single Column */}
      <div className="projects-layout">
        {/* Testimonials List - Always visible */}
        <div className="projects-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">All Testimonials</h2>
            <span className="project-count">{testimonials.length} testimonials</span>
          </div>

          <div className="projects-list">
            {testimonials.length === 0 ? (
              <EmptyState 
                icon="💬"
                title="No testimonials yet"
                description="Click the + button to add your first testimonial"
              />
            ) : (
              testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className={`project-item ${
                    editingTestimonial?.id === testimonial.id ? 'active' : ''
                  } ${
                    !testimonial.isShown ? 'hidden-project' : ''
                  }`}
                  onClick={() => handleTestimonialClick(testimonial)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="project-item-header">
                    <div className="project-item-info">
                      <h3 className="project-item-name">{testimonial.name}</h3>
                      <span className="project-item-category">{testimonial.role}</span>
                    </div>
                    <div className="project-item-status">
                      <label className="visibility-toggle" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={testimonial.isShown}
                          onChange={() => handleToggleVisibility(testimonial)}
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

        {/* Desktop: Testimonial Form Panel */}
        <div className="project-form-panel desktop-only">
          <div className="form-panel-header">
            <h2 className="form-panel-title">
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>
            {editingTestimonial && (
              <button
                onClick={() => setEditingTestimonial(null)}
                className="form-panel-close"
                title="Cancel editing"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="form-panel-content">
            <TestimonialForm
              testimonial={editingTestimonial}
              onSubmit={editingTestimonial ? handleEditTestimonial : handleCreateTestimonial}
              onClose={() => setEditingTestimonial(null)}
              onDelete={handleDeleteTestimonialFromForm}
              isInline={true}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Floating Add Button */}
      <button 
        className="floating-add-btn mobile-only"
        onClick={() => setShowCreateModal(true)}
        title="Add New Testimonial"
      >
        <FaPlus />
      </button>

      {/* Mobile: Create Testimonial Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container project-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Testimonial</h2>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content-form">
              <TestimonialForm
                testimonial={null}
                onSubmit={handleCreateTestimonial}
                onClose={() => setShowCreateModal(false)}
                isInline={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Edit Testimonial Modal */}
      {showEditModal && editingTestimonial && (
        <div className="modal-overlay">
          <div className="modal-container project-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">Edit Testimonial</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false)
                  setEditingTestimonial(null)
                }} 
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content-form">
              <TestimonialForm
                testimonial={editingTestimonial}
                onSubmit={async (data) => {
                  const success = await handleEditTestimonial(data)
                  if (success) {
                    // After successful edit, show create form on mobile
                    setShowEditModal(false)
                    setShowCreateModal(true)
                  }
                  return success
                }}
                onClose={() => {
                  setShowEditModal(false)
                  setEditingTestimonial(null)
                }}
                onDelete={handleDeleteTestimonialFromForm}
                isInline={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.show}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from "${deleteModal.testimonial?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteTestimonial}
        onClose={() => setDeleteModal({ show: false, testimonial: null })}
      />
    </div>
  )
}
