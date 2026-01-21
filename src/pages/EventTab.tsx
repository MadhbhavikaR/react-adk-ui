import { useState } from 'react'
import { useTraceStore } from '../stores/traceStore'
import './EventTab.css'

export default function EventTab() {
  const [view, setView] = useState<'events' | 'trace'>('events')
  const { traceData, invocTraces } = useTraceStore()

  // Sample events data for demonstration
  const sampleEvents = new Map<string, any>([
    ['event_1', { title: 'User greeting', content: 'Hello, how are you?' }],
    ['event_2', { title: 'Agent response', content: 'I am doing well, thank you!' }],
    ['event_3', { title: 'Tool execution', content: 'Searching for information...' }],
    ['event_4', { title: 'Final response', content: 'Here is the information you requested.' }]
  ])

  const handleEventSelect = (eventKey: string) => {
    console.log('Selected event:', eventKey)
    // In a real implementation, this would emit the selected event
  }

  const handleTraceSelect = (traceId: string) => {
    console.log('Selected trace:', traceId)
    // In a real implementation, this would open a trace dialog
  }

  const findInvocId = (spans: any[]) => {
    return spans
      ?.find(item => item.attributes !== undefined &&
          'gcp.vertex.agent.invocation_id' in item.attributes)
      ?.attributes['gcp.vertex.agent.invocation_id']
  }

  return (
    <div className="event-tab">
      <div className="events-wrapper">
        {sampleEvents.size > 0 ? (
          <div className="events-container">
            <div className="event-header">
              {view === 'events' && (
                <p>Conversations</p>
              )}
              {view === 'trace' && (
                <p>Trace Viewer</p>
              )}
              
              {traceData.length > 0 && (
                <div className="view-toggle">
                  <button
                    className={`toggle-button ${view === 'events' ? 'active' : ''}`}
                    onClick={() => setView('events')}
                  >
                    Events
                  </button>
                  <button
                    className={`toggle-button ${view === 'trace' ? 'active' : ''}`}
                    onClick={() => setView('trace')}
                  >
                    Trace
                  </button>
                </div>
              )}
            </div>

            {view === 'events' && (
              <div className="event-list">
                {Array.from(sampleEvents.entries()).map(([key, event], index) => (
                  <div
                    key={key}
                    className="event-item"
                    onClick={() => handleEventSelect(key)}
                  >
                    <span className="event-index">{index}</span>
                    <span className="event-title">{event.title}</span>
                  </div>
                ))}
              </div>
            )}

            {view === 'trace' && (
              <div className="event-list">
                {Array.from(invocTraces.entries()).map(([traceId, spans], index) => (
                  <div
                    key={traceId}
                    className="event-item"
                    onClick={() => handleTraceSelect(traceId)}
                  >
                    <span className="event-index">{index}</span>
                    <span>Invocation {findInvocId(spans)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            No conversations found
          </div>
        )}
      </div>
    </div>
  )
}