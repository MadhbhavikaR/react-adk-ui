import { useState } from 'react'
import './StateTab.css'

export default function StateTab() {
  // Sample session state for demonstration
  const [sessionState] = useState({
    agent: 'test-agent',
    user: 'test-user',
    sessionId: 'session_123',
    timestamp: Date.now(),
    variables: {
      conversationHistory: ['Hello', 'Hi there!'],
      userPreferences: { theme: 'light', language: 'en' },
      currentContext: 'general'
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0'
    }
  })

  const isEmptyState = !sessionState || Object.keys(sessionState).length === 0

  // Simple JSON viewer component
  const JsonViewer = ({ data }: { data: any }) => {
    return (
      <div className="json-container">
        <pre className="json-pre">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  }

  return (
    <div className="state-tab">
      <div className="state-wrapper">
        <h2>State Viewer</h2>
        
        {isEmptyState ? (
          <div className="empty-state">State is empty</div>
        ) : (
          <div className="state-content">
            <div className="state-header">
              <h3>Session State</h3>
              <div className="state-info">
                <span>Session ID: {sessionState.sessionId}</span>
                <span>Agent: {sessionState.agent}</span>
              </div>
            </div>
            <div className="json-viewer-container">
              <JsonViewer data={sessionState} />
            </div>
            <div className="state-actions">
              <button className="copy-button" onClick={() => navigator.clipboard.writeText(JSON.stringify(sessionState, null, 2))}>
                Copy JSON
              </button>
              <button className="download-button" onClick={() => {
                const blob = new Blob([JSON.stringify(sessionState, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `state_${sessionState.sessionId}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}>
                Download JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}