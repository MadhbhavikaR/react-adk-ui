import { useState } from 'react'
import './ConfirmationDialog.css'

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}: ConfirmationDialogProps) => {
  const [showDialog, setShowDialog] = useState(isOpen)

  if (!showDialog) return null

  const handleConfirm = () => {
    setShowDialog(false)
    onConfirm()
  }

  const handleCancel = () => {
    setShowDialog(false)
    onCancel()
  }

  return (
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog">
        <div className="dialog-header">
          <h3>{title}</h3>
        </div>
        <div className="dialog-content">
          <p>{message}</p>
        </div>
        <div className="dialog-actions">
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button className="confirm-button" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog