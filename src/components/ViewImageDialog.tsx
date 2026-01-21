import { useState } from 'react'
import './ViewImageDialog.css'

interface ViewImageDialogProps {
  isOpen: boolean;
  imageData: string;
  onClose: () => void;
}

export const ViewImageDialog = ({ 
  isOpen, 
  imageData, 
  onClose 
}: ViewImageDialogProps) => {
  const [showDialog, setShowDialog] = useState(isOpen)

  if (!showDialog) return null

  const handleClose = () => {
    setShowDialog(false)
    onClose()
  }

  return (
    <div className="view-image-dialog-overlay" onClick={handleClose}>
      <div className="view-image-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        <div className="image-container">
          <img src={imageData} alt="View" className="dialog-image" />
        </div>
      </div>
    </div>
  )
}

export default ViewImageDialog