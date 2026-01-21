import { create } from 'zustand'

interface Session {
  id: string;
  appName: string;
  userId: string;
  lastUpdateTime: number;
  state?: any[];
  events?: any[];
}

interface SessionManagementState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  filter: string;
  pageToken: string;
  canLoadMore: boolean;
  fetchSessions: (userId: string, appName: string) => Promise<void>;
  loadMoreSessions: () => Promise<void>;
  selectSession: (session: Session) => void;
  setFilter: (filter: string) => void;
  clearSessions: () => void;
}

export const useSessionManagementStore = create<SessionManagementState>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
  filter: '',
  pageToken: '',
  canLoadMore: false,

  fetchSessions: async (userId: string, appName: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Validate inputs
      if (!userId || !appName) {
        throw new Error('User ID and App Name are required');
      }

      // In a real implementation, this would call an API
      // For now, we'll use mock data
      const mockSessions: Session[] = [
        {
          id: 'session_1',
          appName,
          userId,
          lastUpdateTime: Date.now() - 86400000, // 1 day ago
          state: [],
          events: []
        },
        {
          id: 'session_2',
          appName,
          userId,
          lastUpdateTime: Date.now() - 3600000, // 1 hour ago
          state: [],
          events: []
        },
        {
          id: 'session_3',
          appName,
          userId,
          lastUpdateTime: Date.now() - 1800000, // 30 minutes ago
          state: [],
          events: []
        }
      ];
      
      // Validate mock data
      if (!Array.isArray(mockSessions)) {
        throw new Error('Invalid sessions data format');
      }

      set({
        sessions: mockSessions,
        isLoading: false,
        canLoadMore: false
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch sessions';
      
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },

  loadMoreSessions: async () => {
    if (!get().canLoadMore) return;
    
    set({ isLoading: true });
    
    try {
      // In a real implementation, this would fetch more sessions using pageToken
      // For mock purposes, we'll just add more sessions
      const currentSessions = get().sessions;
      const newSessions: Session[] = [
        {
          id: `session_${currentSessions.length + 1}`,
          appName: currentSessions[0]?.appName || '',
          userId: currentSessions[0]?.userId || '',
          lastUpdateTime: Date.now() - 900000, // 15 minutes ago
          state: [],
          events: []
        }
      ];
      
      set({
        sessions: [...currentSessions, ...newSessions],
        isLoading: false,
        canLoadMore: false
      });
    } catch (error) {
      set({ 
        error: 'Failed to load more sessions', 
        isLoading: false 
      });
    }
  },

  selectSession: (session: Session) => {
    set({ currentSession: session });
  },

  setFilter: (filter: string) => {
    set({ filter, pageToken: '' });
  },

  clearSessions: () => {
    set({
      sessions: [],
      currentSession: null,
      pageToken: '',
      canLoadMore: false,
      error: null
    });
  }
}));

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const getSessionById = (sessions: Session[], sessionId: string): Session | undefined => {
  return sessions.find(session => session.id === sessionId);
};