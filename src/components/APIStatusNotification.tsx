import { useAgentStore } from '../stores/agentStore'
import { useEffect, useState } from 'react'

export const APIStatusNotification = () => {
  const { apiUnavailable } = useAgentStore()
  const [showNotification, setShowNotification] = useState(false)
  
  // Show notification after UI loads (3 seconds delay)
  useEffect(() => {
    if (apiUnavailable) {
      const timer = setTimeout(() => {
        setShowNotification(true)
      }, 3000) // Show after 3 seconds
      
      return () => clearTimeout(timer)
    }
  }, [apiUnavailable])
  
  if (!showNotification || !apiUnavailable) return null
  
  return (
    <div className="api-status-notification">
      <div className="notification-content">
        <div className="notification-icon">ℹ️</div>
        <div className="notification-message">
          <strong>Backend API Not Available</strong>
          <p>Using mock data for development. Some features may be limited.</p>
          <p>To use full functionality, please start the backend service.</p>
        </div>
        <button 
          className="notification-close" 
          onClick={() => setShowNotification(false)}
        >
          ×
        </button>
      </div>
    </div>
  )
}