import { useEffect } from 'react'
import { useAgentStore } from '../stores/agentStore'

export const AgentSelector = () => {
  const { agents, currentAgent, isLoading, error, fetchAgents, setCurrentAgent } = useAgentStore()

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  if (isLoading) return <div>Loading agents...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <select
      value={currentAgent || ''}
      onChange={(e) => setCurrentAgent(e.target.value)}
      className="agent-selector"
    >
      <option value="">Select an agent</option>
      {agents.map((agent) => (
        <option key={agent} value={agent}>{agent}</option>
      ))}
    </select>
  )
}