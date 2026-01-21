import { useEffect, useState } from 'react'
import { useSessionManagementStore, formatDate } from '../stores/sessionManagementStore'
import './Sessions.css'

export default function Sessions() {
  const [userId] = useState('test-user')
  const [appName] = useState('test-app')
  const [filter, setFilter] = useState('')
  
  const {
    sessions,
    currentSession,
    isLoading,
    error,
    canLoadMore,
    fetchSessions,
    loadMoreSessions,
    selectSession,
    setFilter: setStoreFilter,
    clearSessions
  } = useSessionManagementStore()

  useEffect(() => {
    fetchSessions(userId, appName)
    
    return () => {
      clearSessions()
    }
  }, [fetchSessions, userId, appName, clearSessions])

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value
    setFilter(newFilter)
    setStoreFilter(newFilter)
  }

  const handleSessionClick = (session: any) => {
    selectSession(session)
  }

  const handleLoadMore = () => {
    loadMoreSessions()
  }

  const filteredSessions = sessions.filter(session => {
    if (!filter) return true
    return session.id.includes(filter)
  })

  return (
    <div className="sessions-page">
      <h2>Sessions Management</h2>
      
      <div className="sessions-controls">
        <div className="filter-control">
          <input
            type="text"
            placeholder="Filter sessions..."
            value={filter}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>
      </div>

      {isLoading && sessions.length === 0 ? (
        <div className="loading-indicator">Loading sessions...</div>
      ) : error ? (
        <div className="error-message">Error: {error}</div>
      ) : filteredSessions.length === 0 ? (
        <div className="empty-state">No sessions found</div>
      ) : (
        <div className="sessions-list">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${currentSession?.id === session.id ? 'selected' : ''}`}
              onClick={() => handleSessionClick(session)}
            >
              <div className="session-header">
                <div className="session-id">Session: {session.id}</div>
                <div className="session-time">{formatDate(session.lastUpdateTime)}</div>
              </div>
              <div className="session-details">
                <div className="session-meta">
                  <span className="session-app">App: {session.appName}</span>
                  <span className="session-user">User: {session.userId}</span>
                </div>
              </div>
            </div>
          ))}

          {canLoadMore && (
            <button
              onClick={handleLoadMore}
              className="load-more-button"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      )}

      {currentSession && (
        <div className="session-details-panel">
          <h3>Session Details</h3>
          <div className="session-detail-row">
            <span className="detail-label">Session ID:</span>
            <span className="detail-value">{currentSession.id}</span>
          </div>
          <div className="session-detail-row">
            <span className="detail-label">App Name:</span>
            <span className="detail-value">{currentSession.appName}</span>
          </div>
          <div className="session-detail-row">
            <span className="detail-label">User ID:</span>
            <span className="detail-value">{currentSession.userId}</span>
          </div>
          <div className="session-detail-row">
            <span className="detail-label">Last Updated:</span>
            <span className="detail-value">{formatDate(currentSession.lastUpdateTime)}</span>
          </div>
          <div className="session-detail-row">
            <span className="detail-label">Events:</span>
            <span className="detail-value">{currentSession.events?.length || 0}</span>
          </div>
        </div>
      )}
    </div>
  )
}