import { create } from 'zustand'
import { API } from '../services/api'

interface AgentState {
  agents: string[]
  currentAgent: string | null
  isLoading: boolean
  error: string | null
  usingMockData: boolean
  apiUnavailable: boolean
  fetchAgents: () => Promise<void>
  setCurrentAgent: (agentName: string) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  currentAgent: null,
  isLoading: false,
  error: null,
  usingMockData: false,
  apiUnavailable: false,

  fetchAgents: async () => {
    set({ isLoading: true, error: null, usingMockData: false })
    try {
      const response = await API.getAgents()
      set({ agents: response.data, isLoading: false })
      // Auto-select first agent if available
      if (response.data.length > 0) {
        set({ currentAgent: response.data[0] })
      }
    } catch (error) {
      console.error('Failed to fetch agents, using mock data:', error)
      // Use mock data as fallback
      const mockAgents = ['default-agent', 'chat-agent', 'analysis-agent']
      set({ 
        agents: mockAgents, 
        currentAgent: mockAgents[0], 
        isLoading: false,
        error: null,  // Don't show error to user
        usingMockData: true,  // Flag that we're using mock data
        apiUnavailable: true  // Flag that API is unavailable
      })
    }
  },

  setCurrentAgent: (agentName) => set({ currentAgent: agentName }),
}))