'use client'

import { useState, useRef, useEffect } from 'react'
import { FaTimes, FaImage } from 'react-icons/fa'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import ToggleSwitch from '../ui/ToggleSwitch'

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

interface TestimonialFormProps {
  testimonial?: Testimonial | null
  onSubmit: (data: FormData) => Promise<boolean>
  onClose: () => void
  onDelete?: (testimonial: Testimonial) => Promise<void>
  isInline?: boolean
}

export default function TestimonialForm({ testimonial, onSubmit, onClose, onDelete, isInline = false }: TestimonialFormProps) {
  const [formData, setFormData] = useState({
    name: testimonial?.name || '',
    role: testimonial?.role || '',
    text: testimonial?.text || '',
    isShown: testimonial?.isShown ?? true,
    orderIndex: testimonial?.orderIndex || 0,
  })
  
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(testimonial?.imageUrl || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reload form data when testimonial changes
  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name || '',
        role: testimonial.role || '',
        text: testimonial.text || '',
        isShown: testimonial.isShown ?? true,
        orderIndex: testimonial.orderIndex || 0,
      })
      setImagePreview(testimonial.imageUrl || '')
      setImage(null)
    } else {
      // Reset form for new testimonial
      setFormData({
        name: '',
        role: '',
        text: '',
        isShown: true,
        orderIndex: 0,
      })
      setImagePreview('')
      setImage(null)
    }
  }, [testimonial])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must not exceed 5MB')
      return
    }

    setImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.role.trim() || !formData.text.trim()) {
      alert('Name, role, and testimonial text are required')
      return
    }

    setIsSubmitting(true)

    const submitData = new FormData()
    submitData.append('name', formData.name.trim())
    submitData.append('role', formData.role.trim())
    submitData.append('text', formData.text.trim())
    submitData.append('isShown', String(formData.isShown))
    submitData.append('orderIndex', String(formData.orderIndex))
    
    if (image) {
      submitData.append('image', image)
    }

    const success = await onSubmit(submitData)
    setIsSubmitting(false)

    if (success) {
      // Reset form
      setFormData({
        name: '',
        role: '',
        text: '',
        isShown: true,
        orderIndex: 0,
      })
      setImage(null)
      setImagePreview('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!testimonial || !onDelete) return
    
    const confirmed = confirm(`Are you sure you want to delete the testimonial from "${testimonial.name}"?`)
    if (confirmed) {
      await onDelete(testimonial)
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-content">
        {/* Name */}
        <FormField label="Name *" htmlFor="name">
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter person's name"
            required
          />
        </FormField>

        {/* Role */}
        <FormField label="Role/Title *" htmlFor="role">
          <Input
            id="role"
            type="text"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            placeholder="e.g., VP of Operations, TechFlow Inc."
            required
          />
        </FormField>

        {/* Testimonial Text */}
        <FormField label="Testimonial *" htmlFor="text">
          <Textarea
            id="text"
            value={formData.text}
            onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Enter testimonial text..."
            rows={6}
            required
          />
        </FormField>

        {/* Image Upload */}
        <FormField label="Person Image (Optional)" htmlFor="image">
          <div className="image-upload-section">
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button type="button" onClick={removeImage} className="remove-image-btn" title="Remove image">
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div className="image-upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                <FaImage />
                <span>Click to upload</span>
                <small>Max: 5MB</small>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
        </FormField>

        {/* Order Index */}
        <FormField label="Display Order" htmlFor="orderIndex">
          <Input
            id="orderIndex"
            type="number"
            value={formData.orderIndex}
            onChange={(e) => setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))}
            placeholder="0"
            min="0"
          />
        </FormField>

        {/* Visibility Toggle */}
        <FormField label="Visibility" htmlFor="isShown">
          <div className="toggle-field">
            <ToggleSwitch
              id="isShown"
              checked={formData.isShown}
              onChange={(e) => setFormData(prev => ({ ...prev, isShown: e.target.checked }))}
            />
            <span>{formData.isShown ? 'Shown' : 'Hidden'}</span>
          </div>
        </FormField>
      </div>

      <div className="form-actions-inline">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (testimonial ? 'Update' : 'Create')}
        </Button>
        
        {testimonial && onDelete && (
          <Button type="button" variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
