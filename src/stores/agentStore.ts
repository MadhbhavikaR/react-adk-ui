import { create } from 'zustand'
import { API } from '../services/api'

interface AgentState {
  agents: string[]
  currentAgent: string | null
  isLoading: boolean
  error: string | null
  fetchAgents: () => Promise<void>
  setCurrentAgent: (agentName: string) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],
  currentAgent: null,
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await API.getAgents()
      set({ agents: response.data, isLoading: false })
    } catch (error) {
      set({ error: 'Failed to fetch agents', isLoading: false })
    }
  },

  setCurrentAgent: (agentName) => set({ currentAgent: agentName }),
}))