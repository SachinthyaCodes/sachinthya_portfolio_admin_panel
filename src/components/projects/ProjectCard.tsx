'use client'

import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaGithub, FaExternalLinkAlt } from 'react-icons/fa'
import { SiKaggle, SiMedium } from 'react-icons/si'

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
  createdAt: Date
  updatedAt: Date
}

interface ProjectLink {
  type: 'GitHub' | 'HuggingFace' | 'Kaggle' | 'Medium' | 'Live Demo' | 'Documentation' | 'Other'
  url: string
  label?: string
}

interface ProjectCardProps {
  project: Project
  onEdit: () => void
  onDelete: () => void
  onToggleVisibility: () => void
}

const getLinkIcon = (type: string) => {
  switch (type) {
    case 'GitHub':
      return <FaGithub />
    case 'Kaggle':
      return <SiKaggle />
    case 'Medium':
      return <SiMedium />
    case 'Live Demo':
      return <FaExternalLinkAlt />
    default:
      return <FaExternalLinkAlt />
  }
}

export default function ProjectCard({ project, onEdit, onDelete, onToggleVisibility }: ProjectCardProps) {
  return (
    <div className={`project-card ${project.isShown ? 'shown' : 'hidden'}`}>
      <div className="project-card-image">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.name} />
        ) : (
          <div className="project-image-placeholder">
            <span>No Image</span>
          </div>
        )}
        <div className="project-status-badge">
          {project.isShown ? (
            <span className="status-shown">
              <FaEye /> Shown
            </span>
          ) : (
            <span className="status-hidden">
              <FaEyeSlash /> Hidden
            </span>
          )}
        </div>
      </div>

      <div className="project-card-content">
        <div className="project-header">
          <h3 className="project-name">{project.name}</h3>
          <span className="project-category">{project.category}</span>
        </div>

        <p className="project-description">{project.description}</p>

        <div className="project-tech">
          {project.tech.slice(0, 4).map((tech, index) => (
            <span key={index} className="tech-tag-small">
              {tech}
            </span>
          ))}
          {project.tech.length > 4 && (
            <span className="tech-count">+{project.tech.length - 4}</span>
          )}
        </div>

        {project.links.length > 0 && (
          <div className="project-links">
            {project.links.slice(0, 3).map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
                title={`${link.type}: ${link.label || link.url}`}
              >
                {getLinkIcon(link.type)}
              </a>
            ))}
            {project.links.length > 3 && (
              <span className="links-count">+{project.links.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="project-card-actions">
        <button
          onClick={onToggleVisibility}
          className={`action-btn visibility-btn ${project.isShown ? 'hide' : 'show'}`}
          title={project.isShown ? 'Hide from portfolio' : 'Show in portfolio'}
        >
          {project.isShown ? <FaEyeSlash /> : <FaEye />}
        </button>
        
        <button
          onClick={onEdit}
          className="action-btn edit-btn"
          title="Edit project"
        >
          <FaEdit />
        </button>
        
        <button
          onClick={onDelete}
          className="action-btn delete-btn"
          title="Delete project"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  )
}