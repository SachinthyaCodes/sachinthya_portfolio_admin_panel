'use client'

import { useEffect } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmModal({
  isOpen,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onClose
}: ConfirmModalProps) {
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }

    // Cleanup when component unmounts
    return () => {
      document.body.classList.remove('no-scroll')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-message">
          {message}
        </div>

        <div className="modal-actions">
          <button
            onClick={onClose}
            className="btn-cancel"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`btn-${confirmVariant === 'danger' ? 'danger' : 'primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}