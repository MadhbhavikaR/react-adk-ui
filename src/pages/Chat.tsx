import { AgentSelector } from '../components/AgentSelector'
import { ChatInterface } from '../components/ChatInterface'
import { APIStatusNotification } from '../components/APIStatusNotification'
import { useAgentStore } from '../stores/agentStore'
import { useEffect } from 'react'

export default function Chat() {
  const { agents, currentAgent, isLoading, error, fetchAgents } = useAgentStore()
  
  // Auto-fetch agents on component mount
  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])
  
  // Show loading state
  if (isLoading && agents.length === 0) {
    return (
      <div className="chat-page loading">
        <div className="header">
          <h1>ADK Web - React</h1>
          <p>Loading agents...</p>
        </div>
      </div>
    )
  }
  
  // Show error state (though we use mock data, this is a fallback)
  if (error) {
    return (
      <div className="chat-page error">
        <div className="header">
          <h1>ADK Web - React</h1>
          <p>Error: {error}</p>
          <button onClick={fetchAgents}>Retry</button>
        </div>
      </div>
    )
  }
  
  // Show empty state
  if (agents.length === 0) {
    return (
      <div className="chat-page empty">
        <div className="header">
          <h1>ADK Web - React</h1>
          <p>No agents available</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="chat-page">
      <div className="header">
        <h1>ADK Web - React</h1>
        <AgentSelector />
      </div>
      <div className="content">
        <ChatInterface />
      </div>
      <APIStatusNotification />
    </div>
  )
}