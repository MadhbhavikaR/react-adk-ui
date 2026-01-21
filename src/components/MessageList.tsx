import { useSessionStore } from '../stores/sessionStore'
import { MessageCard } from './MessageCard'
import { List } from 'react-window'
import { AutoSizer } from 'react-virtualized-auto-sizer'

export const MessageList = () => {
  const { getFilteredEvents } = useSessionStore()
  const filteredEvents = getFilteredEvents()

  if (filteredEvents.length === 0) {
    return <div className="message-list-empty">No messages yet. Start a conversation!</div>
  }

  // Convert events to message format for MessageCard
  const messages = filteredEvents.map((event, index) => ({
    id: `msg-${index}`,
    role: event.role || 'system',
    content: event.content || JSON.stringify(event, null, 2),
    timestamp: event.timestamp || new Date().toISOString(),
    status: event.status || 'delivered',
  }))

  // Row component for virtualized list
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <MessageCard 
        message={messages[index]}
        onFeedback={(feedback) => {
          console.log(`Feedback for message ${index}: ${feedback}`)
        }}
      />
    </div>
  )

  return (
    <div className="message-list" style={{ height: '100%', width: '100%' }}>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List
            height={height}
            itemCount={messages.length}
            itemSize={150} // Estimated message card height
            width={width}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  )
}