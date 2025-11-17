'use client'

import { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import ProjectForm from '@/components/projects/ProjectForm'
import ConfirmModal from '@/components/ui/ConfirmModal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { API_ENDPOINTS } from '../../../lib/api'
import './projects.css'

interface Project {
  id: string
  title: string // Changed from 'name' to 'title'
  category: string
  description: string
  technology: string // Changed from 'tech: string[]' to 'technology: string'
  status: 'active' | 'completed' | 'on-hold'
  priority: 'low' | 'medium' | 'high'
  order_index: number
  is_shown: boolean // Changed from 'isShown' to 'is_shown'
  display_order?: number | null // Changed from 'order' to 'display_order'
  user_id: string
  created_at: string // Changed from 'createdAt?: Date' to 'created_at: string'
  updated_at: string // Changed from 'updatedAt?: Date' to 'updated_at: string'
}

// Removed ProjectLink interface - simplified structure

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
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
        return true
      }
      return false
    } catch (error) {
      console.error('Error creating project:', error)
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
        setEditingProject(null)
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating project:', error)
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
      }
    } catch (error) {
      console.error('Error deleting project:', error)
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
        if (project.is_shown && typeof project.display_order === 'number') {
          await reorderProjectsAfterHiding(project.display_order)
        }
        await fetchProjects()
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const reorderProjectsAfterHiding = async (hiddenProjectOrder: number) => {
    try {
      const token = localStorage.getItem('token')
      const shownProjectsToReorder = projects.filter(p => p.is_shown && typeof p.display_order === 'number' && p.display_order > hiddenProjectOrder)
      
      // Update each project's order to move up by 1
      for (const proj of shownProjectsToReorder) {
        if (typeof proj.display_order === 'number') {
          await fetch(API_ENDPOINTS.PROJECTS.BY_ID(proj.id), {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ display_order: proj.display_order - 1 })
          })
        }
      }
    } catch (error) {
      console.error('Error reordering projects:', error)
    }
  }

  const handleDeleteProjectFromForm = async (project: Project) => {
    setDeleteModal({ show: true, project })
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
    if (!draggedProject.is_shown || !targetProject.is_shown) {
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

  // Smart sorting: First 5 shown projects by order, then hidden projects by title
  const sortedProjects = [...projects].sort((a, b) => {
    // If both projects are shown, sort by display_order
    if (a.is_shown && b.is_shown) {
      return (a.display_order || 1) - (b.display_order || 1)
    }
    
    // If both projects are hidden, sort by title
    if (!a.is_shown && !b.is_shown) {
      return a.title.localeCompare(b.title)
    }
    
    // Shown projects always come before hidden projects
    if (a.is_shown && !b.is_shown) return -1
    if (!a.is_shown && b.is_shown) return 1
    
    return 0
  })

  if (loading) {
    return (
      <div className="projects-page-split">
        <LoadingSpinner message="Loading projects..." />
      </div>
    )
  }

  return (
    <div className="projects-page-split">
      {/* Two Column Layout */}
      <div className="projects-layout">
        {/* Left Column - Project List */}
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
                description="Add your first project using the form →"
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
                    !project.is_shown ? 'hidden-project' : ''
                  }`}
                  }`}
                  onClick={() => setEditingProject(project)}
                  draggable={project.is_shown} // Only allow dragging of shown projects
                  onDragStart={(e) => project.is_shown ? handleDragStart(e, project) : e.preventDefault()}
                  onDragOver={(e) => project.is_shown ? handleDragOver(e, index) : undefined}
                  onDragLeave={project.is_shown ? handleDragLeave : undefined}
                  onDrop={(e) => project.is_shown ? handleDrop(e, project) : undefined}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="project-item-header">
                    <div className="project-item-info">
                      <h3 className="project-item-name">{project.title}</h3>
                      <span className="project-item-category">{project.category}</span>
                    </div>
                    <div className="project-item-status">
                      <span className="project-order">
                        {project.is_shown ? `#${project.display_order || 1}` : '●'}
                      </span>
                      <label className="visibility-toggle" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={project.is_shown}
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

        {/* Right Column - Project Form */}
        <div className="project-form-panel">
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