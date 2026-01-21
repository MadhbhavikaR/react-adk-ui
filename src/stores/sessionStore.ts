import { create } from 'zustand'

interface SessionState {
  sessionId: string | null
  events: any[]
  isStreaming: boolean
  searchQuery: string
  filters: {
    roles: string[]
    statuses: string[]
    types: string[]
  }
  addEvent: (event: any) => void
  startSession: () => void
  endSession: () => void
  clearEvents: () => void
  setSearchQuery: (query: string) => void
  setFilters: (filters: { roles?: string[]; statuses?: string[]; types?: string[] }) => void
  clearFilters: () => void
  getFilteredEvents: () => any[]
  getGroupedMessages: (groupBy: 'date' | 'conversation' | 'role') => Record<string, any[]>
  pagination: {
    page: number
    pageSize: number
  }
  setPagination: (page: number, pageSize: number) => void
  getPaginatedMessages: () => any[]
  getTotalPages: () => number
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  events: [],
  isStreaming: false,
  searchQuery: '',
  filters: {
    roles: [],
    statuses: [],
    types: [],
  },
  pagination: {
    page: 1,
    pageSize: 20,
  },

  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),

  startSession: () => set({ 
    sessionId: `session_${Date.now()}`, 
    events: [],
    isStreaming: true 
  }),

  endSession: () => set({ isStreaming: false }),

  clearEvents: () => set({ events: [] }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  setFilters: (filters: { roles?: string[]; statuses?: string[]; types?: string[] }) => 
    set((state) => ({
      filters: {
        roles: filters.roles || state.filters.roles,
        statuses: filters.statuses || state.filters.statuses,
        types: filters.types || state.filters.types,
      }
    })),

  clearFilters: () => 
    set({ filters: { roles: [], statuses: [], types: [] } }),

  getFilteredEvents: () => {
    const { events, searchQuery, filters } = get()
    
    // First apply search query filter
    let filteredEvents = searchQuery.trim() 
      ? events.filter((event: any) => 
          (event.content && event.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (event.role && event.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (event.timestamp && event.timestamp.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : events
    
    // Then apply additional filters
    if (filters.roles.length > 0) {
      filteredEvents = filteredEvents.filter((event: any) => 
        filters.roles.includes(event.role)
      )
    }
    
    if (filters.statuses.length > 0) {
      filteredEvents = filteredEvents.filter((event: any) => 
        filters.statuses.includes(event.status)
      )
    }
    
    if (filters.types.length > 0) {
      filteredEvents = filteredEvents.filter((event: any) => 
        filters.types.includes(event.type)
      )
    }
    
    return filteredEvents
  },

  getGroupedMessages: (groupBy: 'date' | 'conversation' | 'role' = 'date') => {
    const filteredEvents = get().getFilteredEvents()
    
    if (groupBy === 'date') {
      return filteredEvents.reduce((groups: Record<string, any[]>, event: any) => {
        const date = event.timestamp ? new Date(event.timestamp).toDateString() : 'Unknown'
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(event)
        return groups
      }, {})
    }
    
    if (groupBy === 'conversation') {
      return filteredEvents.reduce((groups: Record<string, any[]>, event: any) => {
        const conversationId = event.conversationId || event.sessionId || 'default'
        if (!groups[conversationId]) {
          groups[conversationId] = []
        }
        groups[conversationId].push(event)
        return groups
      }, {})
    }
    
    if (groupBy === 'role') {
      return filteredEvents.reduce((groups: Record<string, any[]>, event: any) => {
        const role = event.role || 'unknown'
        if (!groups[role]) {
          groups[role] = []
        }
        groups[role].push(event)
        return groups
      }, {})
    }
    
    return { 'all': filteredEvents }
  }
}))