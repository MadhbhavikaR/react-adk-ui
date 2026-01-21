import { useState } from 'react'
import { useAgentStore } from '../stores/agentStore'
import { useSessionStore } from '../stores/sessionStore'
import { streamEvents } from '../services/eventStream'

export const ChatInterface = () => {
  const [message, setMessage] = useState('')
  const { currentAgent } = useAgentStore()
  const { sessionId, addEvent } = useSessionStore()

  const handleSend = async () => {
    if (!currentAgent || !message.trim()) return

    const payload = {
      appName: currentAgent,
      userId: 'dev_user',
      sessionId,
      newMessage: {
        role: 'user',
        parts: [{ text: message }],
      },
      streaming: true,
    }

    const cleanup = streamEvents(payload, (event) => {
      addEvent(event)
    })

    setMessage('')
    return cleanup
  }

  return (
    <div className="chat-interface">
      <MessageList />
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} disabled={!currentAgent || !message.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}