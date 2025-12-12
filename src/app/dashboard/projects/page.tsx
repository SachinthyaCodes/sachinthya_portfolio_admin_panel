'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaPlus } from 'react-icons/fa'
import toast from 'react-hot-toast'
import ProjectForm from '@/components/projects/ProjectForm'
import ConfirmModal from '@/components/ui/ConfirmModal'
import CustomLoadingSpinner from '@/components/ui/CustomLoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { API_ENDPOINTS } from '../../../lib/api'
import './projects.css'

interface ProjectLink {
  type: 'GitHub' | 'HuggingFace' | 'Kaggle' | 'Medium' | 'Live Demo' | 'Documentation' | 'Other'
  url: string
  label?: string
}

interface Project {
  id: string  // Changed to string to match API_ENDPOINTS.BY_ID expectation
  name: string // API returns mapped 'name' field
  category: string
  description: string
  comprehensiveSummary: string
  tech: string[] // API returns mapped 'tech' array
  imageUrl?: string
  links: ProjectLink[] // ProjectForm expects ProjectLink objects
  isShown: boolean // API returns mapped 'isShown' field
  order?: number // API returns mapped 'order' field
  createdAt?: Date
  updatedAt?: Date
}

// Removed ProjectLink interface - simplified structure

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; project: Project | null }>({
    show: false,
    project: null,
  })
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No authentication token found')
        return
      }
      
      const response = await fetch(API_ENDPOINTS.PROJECTS.BASE, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (projectData: FormData) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.PROJECTS.BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: projectData,
      })

      if (response.ok) {
        await fetchProjects()
        setShowCreateModal(false)
        toast.success('Project created successfully!')
        return true
      }
      toast.error('Failed to create project')
      return false
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Error creating project')
      return false
    }
  }

  const handleEditProject = async (projectData: FormData) => {
    if (!editingProject) return false

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(API_ENDPOINTS.PROJECTS.BY_ID(editingProject.id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: projectData,
      })

      if (response.ok) {
        await fetchProjects()
        // Reset to "Add New Project" mode after successful edit
        setEditingProject(null)
        setShowEditModal(false)
        toast.success('Project updated successfully!')
        return true
      }
      toast.error('Failed to update project')
      return false
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Error updating project')
      return false
    }
  }

  const handleDeleteProject = async () => {
    if (!deleteModal.project) return

    try {
      const token = localStorage.getItem('token')
            const response = await fetch(API_ENDPOINTS.PROJECTS.BY_ID(deleteModal.project.id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchProjects()
        setDeleteModal({ show: false, project: null })
        setEditingProject(null) // Reset form if deleted project was being edited
        toast.success('Project deleted successfully!')
      } else {
        toast.error('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Error deleting project')
    }
  }

  const handleToggleVisibility = async (project: Project) => {
    try {
      const token = localStorage.getItem('token')
            const response = await fetch(API_ENDPOINTS.PROJECTS.TOGGLE_VISIBILITY(project.id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // If project was shown and is being hidden, reorder remaining shown projects
        if (project.isShown && typeof project.order === 'number') {
          await reorderProjectsAfterHiding(project.order)
        }
        await fetchProjects()
        toast.success(project.isShown ? 'Project hidden' : 'Project shown')
      } else {
        toast.error('Failed to toggle visibility')
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
      toast.error('Error toggling visibility')
    }
  }

  const reorderProjectsAfterHiding = async (hiddenProjectOrder: number) => {
    try {
      const token = localStorage.getItem('token')
      const shownProjectsToReorder = projects.filter(p => p.isShown && typeof p.order === 'number' && p.order > hiddenProjectOrder)
      
      // Update each project's order to move up by 1
      for (const proj of shownProjectsToReorder) {
        if (typeof proj.order === 'number') {
          await fetch(API_ENDPOINTS.PROJECTS.BY_ID(proj.id), {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ order: proj.order - 1 })
          })
        }
      }
    } catch (error) {
      console.error('Error reordering projects:', error)
    }
  }

  const handleDeleteProjectFromForm = async (project: Project) => {
    setDeleteModal({ show: true, project })
    setShowEditModal(false)
  }

  const handleProjectClick = (project: Project) => {
    setEditingProject(project)
    // On mobile, show modal; on desktop, form updates inline
    if (window.innerWidth < 1024) {
      setShowEditModal(true)
    }
  }

  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, targetProject: Project) => {
    e.preventDefault()
    setDragOverIndex(null)
    
    if (!draggedProject || draggedProject.id === targetProject.id) {
      setDraggedProject(null)
      return
    }

    // Only allow drag and drop between shown projects (order 1-5)
    if (!draggedProject.isShown || !targetProject.isShown) {
      setDraggedProject(null)
      return
    }

    const draggedOrder = draggedProject.order || 1
    const targetOrder = targetProject.order || 1
    
    try {
      const token = localStorage.getItem('token')
      
      // Swap the orders of the two projects
      await fetch(API_ENDPOINTS.PROJECTS.BY_ID(draggedProject.id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: targetOrder })
      })
      
      await fetch(API_ENDPOINTS.PROJECTS.BY_ID(targetProject.id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order: draggedOrder })
      })
      
      await fetchProjects() // Refresh the list
    } catch (error) {
      console.error('Error updating project order:', error)
    }
    
    setDraggedProject(null)
  }

  // Smart sorting: First 5 shown projects by order, then hidden projects by name
  const sortedProjects = [...projects].sort((a, b) => {
    // If both projects are shown, sort by order
    if (a.isShown && b.isShown) {
      return (a.order || 1) - (b.order || 1)
    }
    
    // If both projects are hidden, sort by name
    if (!a.isShown && !b.isShown) {
      return a.name.localeCompare(b.name)
    }
    
    // Shown projects always come before hidden projects
    if (a.isShown && !b.isShown) return -1
    if (!a.isShown && b.isShown) return 1
    
    return 0
  })

  if (loading) {
    return (
      <CustomLoadingSpinner message="Loading projects..." fullScreen={true} />
    )
  }

  return (
    <div className="projects-page-split">
      {/* Desktop: Two Column Layout, Mobile: Single Column */}
      <div className="projects-layout">
        {/* Projects List - Always visible */}
        <div className="projects-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">All Projects</h2>
            <span className="project-count">{projects.length} projects</span>
          </div>

          <div className="projects-list">
            {projects.length === 0 ? (
              <EmptyState 
                icon="📂"
                title="No projects yet"
                description="Click the + button to add your first project"
              />
            ) : (
              sortedProjects.map((project, index) => (
                <div
                  key={project.id}
                  className={`project-item ${
                    editingProject?.id === project.id ? 'active' : ''
                  } ${
                    dragOverIndex === index ? 'drag-over' : ''
                  } ${
                    !project.isShown ? 'hidden-project' : ''
                  }`}
                  onClick={() => handleProjectClick(project)}
                  draggable={project.isShown}
                  onDragStart={(e) => project.isShown ? handleDragStart(e, project) : e.preventDefault()}
                  onDragOver={(e) => project.isShown ? handleDragOver(e, index) : undefined}
                  onDragLeave={project.isShown ? handleDragLeave : undefined}
                  onDrop={(e) => project.isShown ? handleDrop(e, project) : undefined}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="project-item-header">
                    <div className="project-item-info">
                      <h3 className="project-item-name">{project.name}</h3>
                      <span className="project-item-category">{project.category}</span>
                    </div>
                    <div className="project-item-status">
                      <label className="visibility-toggle" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={project.isShown}
                          onChange={() => handleToggleVisibility(project)}
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

        {/* Desktop: Project Form Panel */}
        <div className="project-form-panel desktop-only">
          <div className="form-panel-header">
            <h2 className="form-panel-title">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>
            {editingProject && (
              <button
                onClick={() => setEditingProject(null)}
                className="form-panel-close"
                title="Cancel editing"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="form-panel-content">
            <ProjectForm
              project={editingProject}
              onSubmit={editingProject ? handleEditProject : handleCreateProject}
              onClose={() => setEditingProject(null)}
              onDelete={handleDeleteProjectFromForm}
              isInline={true}
            />
          </div>
        </div>
      </div>

      {/* Mobile: Floating Add Button */}
      <button 
        className="floating-add-btn mobile-only"
        onClick={() => setShowCreateModal(true)}
        title="Add New Project"
      >
        <FaPlus />
      </button>

      {/* Mobile: Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container project-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Project</h2>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content-form">
              <ProjectForm
                project={null}
                onSubmit={handleCreateProject}
                onClose={() => setShowCreateModal(false)}
                isInline={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className="modal-overlay">
          <div className="modal-container project-form-modal">
            <div className="modal-header">
              <h2 className="modal-title">Edit Project</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false)
                  setEditingProject(null)
                }} 
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-content-form">
              <ProjectForm
                project={editingProject}
                onSubmit={async (data) => {
                  const success = await handleEditProject(data)
                  if (success) {
                    // After successful edit, show create form on mobile
                    setShowEditModal(false)
                    setShowCreateModal(true)
                  }
                  return success
                }}
                onClose={() => {
                  setShowEditModal(false)
                  setEditingProject(null)
                }}
                onDelete={handleDeleteProjectFromForm}
                isInline={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.show}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteModal.project?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteProject}
        onClose={() => setDeleteModal({ show: false, project: null })}
      />
    </div>
  )
}