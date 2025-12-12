'use client'

import { FaEye, FaEyeSlash, FaEdit, FaTrash } from 'react-icons/fa'

interface Testimonial {
  id: string
  name: string
  role: string
  text: string
  imageUrl?: string
  isShown: boolean
  orderIndex?: number
}

interface TestimonialCardProps {
  testimonial: Testimonial
  onEdit: (testimonial: Testimonial) => void
  onToggleVisibility: (testimonial: Testimonial) => void
  onDelete: (testimonial: Testimonial) => void
}

export default function TestimonialCard({
  testimonial,
  onEdit,
  onToggleVisibility,
  onDelete
}: TestimonialCardProps) {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the testimonial from "${testimonial.name}"?`)) {
      onDelete(testimonial)
    }
  }

  return (
    <div className={`project-card ${!testimonial.isShown ? 'hidden-project' : ''}`}>
      {/* Header with Image */}
      <div className="project-card-header">
        {testimonial.imageUrl ? (
          <img
            src={testimonial.imageUrl}
            alt={testimonial.name}
            className="testimonial-avatar"
          />
        ) : (
          <div className="testimonial-avatar-placeholder">
            {testimonial.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="testimonial-header-info">
          <h3 className="project-card-title">{testimonial.name}</h3>
          <p className="testimonial-role">{testimonial.role}</p>
        </div>
      </div>

      {/* Testimonial Text */}
      <div className="project-card-content">
        <p className="testimonial-text">&ldquo;{testimonial.text}&rdquo;</p>
      </div>

      {/* Actions */}
      <div className="project-card-actions">
        <button
          onClick={() => onToggleVisibility(testimonial)}
          className="action-btn"
          title={testimonial.isShown ? 'Hide' : 'Show'}
        >
          {testimonial.isShown ? <FaEye /> : <FaEyeSlash />}
        </button>
        <button
          onClick={() => onEdit(testimonial)}
          className="action-btn"
          title="Edit"
        >
          <FaEdit />
        </button>
        <button
          onClick={handleDelete}
          className="action-btn delete-btn"
          title="Delete"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  )
}
