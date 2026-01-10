'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CustomLoadingSpinner from '@/components/ui/CustomLoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { API_ENDPOINTS } from '@/lib/api'
import './knowledge.css'

interface KnowledgeDoc {
  id: string
  title: string
  sourceType: 'pdf' | 'docx' | 'text'
  contentPreview?: string
  chunkCount: number
  createdAt?: string
}

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch(API_ENDPOINTS.KNOWLEDGE.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to load knowledge base')

      const data = await res.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error(error)
      toast.error('Could not load knowledge base')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file && !text.trim()) {
      toast.error('Add a file or paste text to ingest')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const formData = new FormData()
      if (file) formData.append('file', file)
      if (text.trim()) formData.append('text', text.trim())
      if (title.trim()) formData.append('title', title.trim())

      const res = await fetch(API_ENDPOINTS.KNOWLEDGE.BASE, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to ingest data')
        return
      }

      toast.success('Ingestion complete')
      setTitle('')
      setText('')
      setFile(null)
      await loadDocuments()
    } catch (error) {
      console.error(error)
      toast.error('Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document and all its chunks?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(API_ENDPOINTS.KNOWLEDGE.BY_ID(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete')
        return
      }

      toast.success('Deleted')
      setDocuments((docs) => docs.filter((d) => d.id !== id))
    } catch (error) {
      console.error(error)
      toast.error('Delete failed')
    }
  }

  return (
    <div className="knowledge-page">
      <div className="knowledge-header">
        <div>
          <h1>Knowledge Base</h1>
          <p>Upload PDFs, DOCX, or paste text to power RAG responses. Free-tier safe: 2MB max per file.</p>
        </div>
        <div className="guidelines">
          <span>Tips: keep chunks concise, avoid duplicate uploads, and prefer text when possible.</span>
        </div>
      </div>

      <div className="knowledge-grid">
        <form className="ingest-card" onSubmit={handleSubmit}>
          <h2>Ingest Content</h2>
          <label className="field">
            <span>Title (optional)</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short label for this source"
            />
          </label>

          <label className="field">
            <span>Upload PDF / DOCX / TXT (max 2MB)</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <div className="divider">or</div>

          <label className="field">
            <span>Paste text</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Quickly add notes, FAQs, or snippets"
              rows={6}
            />
          </label>

          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'Processing…' : 'Add to Knowledge Base'}
          </button>
          <p className="helper">We chunk at ~700 chars with 80 overlap and embed via Hugging Face small model.</p>
        </form>

        <div className="list-card">
          <div className="list-header">
            <h2>Indexed Sources</h2>
            <span>{documents.length} total</span>
          </div>

          {loading ? (
            <div className="loading-row"><CustomLoadingSpinner /></div>
          ) : documents.length === 0 ? (
            <EmptyState
              title="No knowledge yet"
              description="Upload a PDF/DOCX or paste text to start powering RAG responses."
            />
          ) : (
            <div className="doc-list">
              {documents.map((doc) => (
                <div key={doc.id} className="doc-row">
                  <div>
                    <div className="doc-title">{doc.title}</div>
                    <div className="doc-meta">
                      <span className="pill">{doc.sourceType}</span>
                      <span className="pill">{doc.chunkCount} chunks</span>
                      {doc.createdAt && <span>{new Date(doc.createdAt).toLocaleString()}</span>}
                    </div>
                    {doc.contentPreview && (
                      <p className="doc-preview">{doc.contentPreview.slice(0, 140)}{doc.contentPreview.length > 140 ? '…' : ''}</p>
                    )}
                  </div>
                  <button className="ghost" onClick={() => handleDelete(doc.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
