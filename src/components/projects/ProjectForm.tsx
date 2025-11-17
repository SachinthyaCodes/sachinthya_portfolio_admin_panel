'use client'

import { useState, useRef, useEffect } from 'react'
import { FaTimes, FaPlus, FaTrash, FaImage } from 'react-icons/fa'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import ToggleSwitch from '../ui/ToggleSwitch'

interface Project {
  id: string
  name: string
  category: string
  description: string
  comprehensiveSummary: string
  tech: string[]
  imageUrl?: string
  links: ProjectLink[]
  isShown: boolean
  order?: number
  createdAt?: Date
  updatedAt?: Date
}

interface ProjectLink {
  type: 'GitHub' | 'HuggingFace' | 'Kaggle' | 'Medium' | 'Live Demo' | 'Documentation' | 'Other'
  url: string
  label?: string
}

interface ProjectFormProps {
  project?: Project | null
  onSubmit: (data: FormData) => Promise<boolean>
  onClose: () => void
  onDelete?: (project: Project) => Promise<void>
  isInline?: boolean
}

const linkTypes = [
  'GitHub',
  'HuggingFace', 
  'Kaggle',
  'Medium',
  'Live Demo',
  'Documentation',
  'Other'
] as const

const projectCategories = [
  'Data Analytics',
  'AI & Marketing', 
  'FinTech',
  'Supply Chain',
  'Healthcare',
  'Web Development',
  'Mobile App',
  'Machine Learning',
  'Data Visualization',
  'Other'
]

const commonTechStacks = [
  'React', 'Next.js', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Django', 'FastAPI',
  'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
  'PostgreSQL', 'MongoDB', 'MySQL',
  'AWS', 'Azure', 'Docker', 'Kubernetes',
  'TypeScript', 'JavaScript', 'HTML', 'CSS',
  'Git', 'Redis', 'Elasticsearch'
]

export default function ProjectForm({ project, onSubmit, onClose, onDelete, isInline = false }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    category: project?.category || '',
    description: project?.description || '',
    comprehensiveSummary: project?.comprehensiveSummary || '',
    tech: project?.tech || [],
    isShown: project?.isShown || false,
    order: project?.order || 1,
  })
  
  const [links, setLinks] = useState<ProjectLink[]>(project?.links || [])
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(project?.imageUrl || '')
  const [loading, setLoading] = useState(false)
  const [techInput, setTechInput] = useState('')
  const [showTechDropdown, setShowTechDropdown] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reload form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        category: project.category || '',
        description: project.description || '',
        comprehensiveSummary: project.comprehensiveSummary || '',
        tech: project.tech || [],
        isShown: project.isShown || false,
        order: project.order || 1,
      })
      setLinks(project.links || [])
      setImagePreview(project.imageUrl || '')
      setImage(null)
    }
  }, [project])

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

  const addTech = (tech: string) => {
    if (tech.trim() && !formData.tech.includes(tech.trim())) {
      setFormData(prev => ({
        ...prev,
        tech: [...prev.tech, tech.trim()]
      }))
    }
    setTechInput('')
    setShowTechDropdown(false)
  }

  const removeTech = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tech: prev.tech.filter((_, i) => i !== index)
    }))
  }

  const addLink = () => {
    setLinks([...links, { type: 'GitHub', url: '', label: '' }])
  }

  const updateLink = (index: number, field: keyof ProjectLink, value: string) => {
    const updatedLinks = [...links]
    updatedLinks[index] = { ...updatedLinks[index], [field]: value }
    setLinks(updatedLinks)
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      
      submitData.append('name', formData.name)
      submitData.append('category', formData.category)
      submitData.append('description', formData.description)
      submitData.append('comprehensiveSummary', formData.comprehensiveSummary)
      submitData.append('tech', JSON.stringify(formData.tech))
      submitData.append('links', JSON.stringify(links.filter(link => link.url.trim())))
      submitData.append('isShown', formData.isShown.toString())
      submitData.append('order', formData.order.toString())
      
      if (image) {
        submitData.append('image', image)
      }

      const success = await onSubmit(submitData)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTechStacks = commonTechStacks.filter(tech =>
    tech.toLowerCase().includes(techInput.toLowerCase()) &&
    !formData.tech.includes(tech)
  )

  const formContent = (
    <form onSubmit={handleSubmit} className="project-form">
      <div className="form-row">
        <FormField label="Project Name" htmlFor="name" required>
          <Input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter project name"
            required
          />
        </FormField>

        <FormField label="Category" htmlFor="category" required>
          <Select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            options={projectCategories.map(cat => ({ value: cat, label: cat }))}
            placeholder="Select category"
            required
          />
        </FormField>
      </div>

      <div className="form-row">
        <FormField 
          label="Display Order" 
          htmlFor="order" 
          helpText="Lower numbers appear first (1 = highest priority)"
        >
          <Select
            id="order"
            value={formData.order.toString()}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
            options={[
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
              { value: '5', label: '5' }
            ]}
          />
        </FormField>

        <FormField label="Show in Portfolio">
          <ToggleSwitch
            label="Display this project"
            checked={formData.isShown}
            onChange={(e) => setFormData(prev => ({ ...prev, isShown: e.target.checked }))}
          />
        </FormField>
      </div>

      <FormField label="Short Description" htmlFor="description" required>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief project description for portfolio display"
          rows={3}
          maxLength={200}
          showCharCount={true}
          required
        />
      </FormField>

      <FormField label="Comprehensive Summary" htmlFor="comprehensiveSummary" required>
        <Textarea
          id="comprehensiveSummary"
          value={formData.comprehensiveSummary}
          onChange={(e) => setFormData(prev => ({ ...prev, comprehensiveSummary: e.target.value }))}
          placeholder="Detailed project description with technical details, challenges solved, and impact"
          rows={5}
          required
        />
      </FormField>

      <FormField label="Project Image (Max 5MB)">
        <div className="image-upload-section">
          {imagePreview ? (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <button type="button" onClick={removeImage} className="remove-image-btn">
                <FaTimes />
              </button>
            </div>
          ) : (
            <div 
              className="image-upload-placeholder"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaImage className="upload-icon" />
              <span>Click to upload image</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden-file-input"
          />
        </div>
      </FormField>

      <FormField label="Tech Stack">
        <div className="tech-input-section">
          <div className="tech-input-container">
            <input
              type="text"
              value={techInput}
              onChange={(e) => {
                setTechInput(e.target.value)
                setShowTechDropdown(e.target.value.length > 0)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (techInput.trim()) {
                    addTech(techInput)
                  }
                }
              }}
              className="form-input"
              placeholder="Add technology (e.g., React, Python, AWS)"
            />
            {showTechDropdown && filteredTechStacks.length > 0 && (
              <div className="tech-suggestions">
                {filteredTechStacks.slice(0, 8).map(tech => (
                  <div
                    key={tech}
                    onClick={() => addTech(tech)}
                    className="tech-suggestion"
                  >
                    {tech}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="tech-tags">
            {formData.tech.map((tech, index) => (
              <div key={index} className="tech-tag">
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => removeTech(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </FormField>

      <FormField label="Project Links">
        <div className="links-section">
          {links.map((link, index) => (
            <div key={index} className="link-row">
              <select
                value={link.type}
                onChange={(e) => updateLink(index, 'type', e.target.value)}
                className="link-type-select"
              >
                {linkTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                placeholder="Enter URL"
                className="link-url-input"
              />
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="link-remove-btn"
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="add-link-btn"
          >
            <FaPlus /> Add Link
          </button>
        </div>
      </FormField>

      {!isInline && (
        <div className="form-actions">
          <Button
            type="button"
            onClick={onClose}
            variant="cancel"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      )}

      {isInline && (
        <div className="form-actions-inline">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {project ? 'Update Project' : 'Save Project'}
          </Button>
          {project && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={() => onDelete(project)}
              disabled={loading}
            >
              Delete Project
            </Button>
          )}
        </div>
      )}
    </form>
  );

  if (isInline) {
    return formContent;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container project-form-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <FaTimes />
          </button>
        </div>
        {formContent}
      </div>
    </div>
  );
}