import { create } from 'zustand'

interface SessionState {
  sessionId: string | null
  events: any[]
  isStreaming: boolean
  addEvent: (event: any) => void
  startSession: () => void
  endSession: () => void
  clearEvents: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  events: [],
  isStreaming: false,

  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),

  startSession: () => set({ 
    sessionId: `session_${Date.now()}`, 
    events: [],
    isStreaming: true 
  }),

  endSession: () => set({ isStreaming: false }),

  clearEvents: () => set({ events: [] }),
}))