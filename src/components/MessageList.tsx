import { useSessionStore } from '../stores/sessionStore'

export const MessageList = () => {
  const { events } = useSessionStore()

  if (events.length === 0) {
    return <div className="message-list-empty">No messages yet. Start a conversation!</div>
  }

  return (
    <div className="message-list">
      {events.map((event, index) => (
        <div key={index} className={`message ${event.role || 'system'}`}>
          <div className="message-content">{event.content || JSON.stringify(event)}</div>
        </div>
      ))}
    </div>
  )
}