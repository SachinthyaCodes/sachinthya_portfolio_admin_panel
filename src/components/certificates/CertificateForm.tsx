'use client'

import { useEffect, useState, FormEvent } from 'react'
// import { FaTimes } from 'react-icons/fa'
import { Button, FormField, Input, Select, ToggleSwitch } from '@/components/ui'

interface Certificate {
  id?: string
  provider: string
  title: string
  link?: string
  issuedDate: string
  credentialType: string
  isShown: boolean
  orderIndex?: number
}

interface CertificateFormProps {
  certificate?: Certificate | null
  onSubmit: (data: FormData) => Promise<boolean>
  onClose?: () => void
  onDelete?: (id: string) => void
  isInline?: boolean
}

const CERTIFICATE_PROVIDERS = [
  'AWS',
  'Azure',
  'Google Cloud',
  'FreeCodeCamp',
  'DataCamp',
  'Coursera',
  'Udemy',
  'LinkedIn Learning',
  'Pluralsight',
  'edX',
  'CompTIA',
  'Cisco',
  'Oracle',
  'Red Hat',
  'Salesforce',
  'Other'
]

export default function CertificateForm({ 
  certificate, 
  onSubmit, 
  onClose, 
  onDelete,
  isInline = false 
}: CertificateFormProps) {
  const normalizeDate = (value: string) => {
    if (!value) return ''
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    provider: CERTIFICATE_PROVIDERS.includes(certificate?.provider || '') ? certificate?.provider || '' : 'Other',
    customProvider: !CERTIFICATE_PROVIDERS.includes(certificate?.provider || '') && certificate?.provider
      ? certificate.provider
      : '',
    title: certificate?.title || '',
    link: certificate?.link || '',
    issuedDate: certificate?.issuedDate ? normalizeDate(certificate.issuedDate) : '',
    credentialType: certificate?.credentialType || 'certification',
    orderIndex: certificate?.orderIndex ?? 0,
    isShown: certificate?.isShown ?? true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Keep form in sync when selecting a different certificate to edit
  useEffect(() => {
    setFormData({
      provider: CERTIFICATE_PROVIDERS.includes(certificate?.provider || '') ? certificate?.provider || '' : 'Other',
      customProvider: !CERTIFICATE_PROVIDERS.includes(certificate?.provider || '') && certificate?.provider 
        ? certificate.provider 
        : '',
      title: certificate?.title || '',
      link: certificate?.link || '',
      issuedDate: certificate?.issuedDate ? normalizeDate(certificate.issuedDate) : '',
      credentialType: certificate?.credentialType || 'certification',
      orderIndex: certificate?.orderIndex ?? 0,
      isShown: certificate?.isShown ?? true,
    })
  }, [certificate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const providerToSend = formData.provider === 'Other'
      ? formData.customProvider.trim()
      : formData.provider

    if (!providerToSend) {
      setIsSubmitting(false)
      return
    }

    try {
      // Create a plain object matching the expected format
      const submitData = {
        ...formData,
        provider: providerToSend,
      } as unknown as FormData
      
      const success = await onSubmit(submitData)
      if (success) {
        // Reset form if creating new certificate
        if (!certificate) {
          setFormData({
            provider: '',
            customProvider: '',
            title: '',
            link: '',
            issuedDate: '',
            credentialType: 'certification',
            orderIndex: 0,
            isShown: true,
          })
        }
      }
    } catch (error) {
      console.error('Error submitting certificate:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (certificate?.id && onDelete) {
      onDelete(certificate.id)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-content">
        {/* Provider */}
        <FormField label="Certificate Provider *" htmlFor="provider">
          <Select
            id="provider"
            value={formData.provider}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              provider: e.target.value,
              customProvider: e.target.value === 'Other' ? prev.customProvider : ''
            }))}
            options={CERTIFICATE_PROVIDERS.map(provider => ({ 
              value: provider, 
              label: provider 
            }))}
            placeholder="Select provider"
            required
          />
        </FormField>

        {formData.provider === 'Other' && (
          <FormField label="Custom Provider Name *" htmlFor="customProvider">
            <Input
              id="customProvider"
              type="text"
              value={formData.customProvider}
              onChange={(e) => setFormData(prev => ({ ...prev, customProvider: e.target.value }))}
              placeholder="Enter provider name"
              required
            />
          </FormField>
        )}

        {/* Type */}
        <FormField label="Credential Type" htmlFor="credentialType">
          <Select
            id="credentialType"
            value={formData.credentialType}
            onChange={(e) => setFormData(prev => ({ ...prev, credentialType: e.target.value }))}
            options={[
              { value: 'certification', label: 'Certification' },
              { value: 'badge', label: 'Badge' },
            ]}
            required
          />
        </FormField>

        {/* Title */}
        <FormField label="Certificate Title *" htmlFor="title">
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., AWS Certified Solutions Architect"
            required
          />
        </FormField>

        {/* Link */}
        <FormField label="Certificate/Badge Link" htmlFor="link">
          <Input
            id="link"
            type="url"
            value={formData.link}
            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
            placeholder="https://www.credly.com/badges/..."
          />
        </FormField>

        {/* Issued Date */}
        <FormField label="Issued Date *" htmlFor="issuedDate">
          <Input
            id="issuedDate"
            type="date"
            value={formData.issuedDate}
            onChange={(e) => setFormData(prev => ({ ...prev, issuedDate: e.target.value }))}
            required
          />
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
          {isSubmitting ? 'Saving...' : (certificate ? 'Update' : 'Create')}
        </Button>
        
        {certificate && onDelete && (
          <Button type="button" variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
