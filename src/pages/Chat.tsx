import { AgentSelector } from '../components/AgentSelector'
import { ChatInterface } from '../components/ChatInterface'

export default function Chat() {
  return (
    <div className="chat-page">
      <div className="header">
        <h1>ADK Web - React</h1>
        <AgentSelector />
      </div>
      <div className="content">
        <ChatInterface />
      </div>
    </div>
  )
}