import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Sessions from './Sessions'

// Mock the session management store
jest.mock('../stores/sessionManagementStore', () => ({
  useSessionManagementStore: () => ({
    sessions: [],
    currentSession: null,
    isLoading: false,
    error: null,
    canLoadMore: false,
    fetchSessions: jest.fn(),
    loadMoreSessions: jest.fn(),
    selectSession: jest.fn(),
    setFilter: jest.fn(),
    clearSessions: jest.fn(),
    formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
  }),
  formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
}))

describe('Sessions Page', () => {
  const mockSessions = [
    {
      id: 'session1',
      appName: 'test-app',
      userId: 'test-user',
      lastUpdateTime: '2023-01-01T10:00:00Z',
      events: []
    },
    {
      id: 'session2',
      appName: 'test-app',
      userId: 'test-user',
      lastUpdateTime: '2023-01-02T11:00:00Z',
      events: []
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders sessions page with title', () => {
    render(<Sessions />)
    expect(screen.getByText('Sessions Management')).toBeInTheDocument()
  })

  test('renders filter input', () => {
    render(<Sessions />)
    expect(screen.getByPlaceholderText('Filter sessions...')).toBeInTheDocument()
  })

  test('shows loading state when loading', () => {
    jest.mock('../stores/sessionManagementStore', () => ({
      useSessionManagementStore: () => ({
        sessions: [],
        currentSession: null,
        isLoading: true,
        error: null,
        canLoadMore: false,
        fetchSessions: jest.fn(),
        loadMoreSessions: jest.fn(),
        selectSession: jest.fn(),
        setFilter: jest.fn(),
        clearSessions: jest.fn(),
        formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
      }),
      formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Sessions />)
    expect(screen.getByText('Loading sessions...')).toBeInTheDocument()
  })

  test('shows error message when error occurs', () => {
    jest.mock('../stores/sessionManagementStore', () => ({
      useSessionManagementStore: () => ({
        sessions: [],
        currentSession: null,
        isLoading: false,
        error: 'Failed to load sessions',
        canLoadMore: false,
        fetchSessions: jest.fn(),
        loadMoreSessions: jest.fn(),
        selectSession: jest.fn(),
        setFilter: jest.fn(),
        clearSessions: jest.fn(),
        formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
      }),
      formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Sessions />)
    expect(screen.getByText('Error: Failed to load sessions')).toBeInTheDocument()
  })

  test('shows empty state when no sessions', () => {
    render(<Sessions />)
    expect(screen.getByText('No sessions found')).toBeInTheDocument()
  })

  test('renders all sessions in list', () => {
    jest.mock('../stores/sessionManagementStore', () => ({
      useSessionManagementStore: () => ({
        sessions: mockSessions,
        currentSession: null,
        isLoading: false,
        error: null,
        canLoadMore: false,
        fetchSessions: jest.fn(),
        loadMoreSessions: jest.fn(),
        selectSession: jest.fn(),
        setFilter: jest.fn(),
        clearSessions: jest.fn(),
        formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
      }),
      formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Sessions />)
    
    mockSessions.forEach(session => {
      expect(screen.getByText(`Session: ${session.id}`)).toBeInTheDocument()
      expect(screen.getByText(`App: ${session.appName}`)).toBeInTheDocument()
      expect(screen.getByText(`User: ${session.userId}`)).toBeInTheDocument()
    })
  })

  test('calls selectSession when session is clicked', () => {
    const { selectSession } = require('../stores/sessionManagementStore').useSessionManagementStore()
    
    jest.mock('../stores/sessionManagementStore', () => ({
      useSessionManagementStore: () => ({
        sessions: mockSessions,
        currentSession: null,
        isLoading: false,
        error: null,
        canLoadMore: false,
        fetchSessions: jest.fn(),
        loadMoreSessions: jest.fn(),
        selectSession: selectSession,
        setFilter: jest.fn(),
        clearSessions: jest.fn(),
        formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
      }),
      formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Sessions />)
    
    const sessionItems = screen.getAllByTestId('session-item')
    fireEvent.click(sessionItems[0])
    
    expect(selectSession).toHaveBeenCalledWith(mockSessions[0])
  })

  test('applies selected class to current session', () => {
    jest.mock('../stores/sessionManagementStore', () => ({
      useSessionManagementStore: () => ({
        sessions: mockSessions,
        currentSession: mockSessions[0],
        isLoading: false,
        error: null,
        canLoadMore: false,
        fetchSessions: jest.fn(),
        loadMoreSessions: jest.fn(),
        selectSession: jest.fn(),
        setFilter: jest.fn(),
        clearSessions: jest.fn(),
        formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
      }),
      formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Sessions />)
    
    const sessionItems = screen.getAllByTestId('session-item')
    expect(sessionItems[0]).toHaveClass('selected')
    expect(sessionItems[1]).not.toHaveClass('selected')
  })

  test('filters sessions based on input', () => {
    jest.mock('../stores/sessionManagementStore', () => ({
      useSessionManagementStore: () => ({
        sessions: mockSessions,
        currentSession: null,
        isLoading: false,
        error: null,
        canLoadMore: false,
        fetchSessions: jest.fn(),
        loadMoreSessions: jest.fn(),
        selectSession: jest.fn(),
        setFilter: jest.fn(),
        clearSessions: jest.fn(),
        formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
      }),
      formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Sessions />)
    
    const filterInput = screen.getByPlaceholderText('Filter sessions...')
    fireEvent.change(filterInput, { target: { value: 'session1' } })
    
    expect(screen.getByText('Session: session1')).toBeInTheDocument()
    expect(screen.queryByText('Session: session2')).not.toBeInTheDocument()
  })

  test('shows load more button when canLoadMore is true', () => {
    jest.mock('../stores/sessionManagementStore', () => ({
      useSessionManagementStore: () => ({
        sessions: mockSessions,
        currentSession: null,
        isLoading: false,
        error: null,
        canLoadMore: true,
        fetchSessions: jest.fn(),
        loadMoreSessions: jest.fn(),
        selectSession: jest.fn(),
        setFilter: jest.fn(),
        clearSessions: jest.fn(),
        formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
      }),
      formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Sessions />)
    expect(screen.getByText('Load More')).toBeInTheDocument()
  })

  test('calls loadMoreSessions when load more button is clicked', () => {
    const { loadMoreSessions } = require('../stores/sessionManagementStore').useSessionManagementStore()
    
    jest.mock('../stores/sessionManagementStore', () => ({
      useSessionManagementStore: () => ({
        sessions: mockSessions,
        currentSession: null,
        isLoading: false,
        error: null,
        canLoadMore: true,
        fetchSessions: jest.fn(),
        loadMoreSessions: loadMoreSessions,
        selectSession: jest.fn(),
        setFilter: jest.fn(),
        clearSessions: jest.fn(),
        formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
      }),
      formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Sessions />)
    
    const loadMoreButton = screen.getByText('Load More')
    fireEvent.click(loadMoreButton)
    
    expect(loadMoreSessions).toHaveBeenCalled()
  })

  test('shows session details panel when session is selected', () => {
    jest.mock('../stores/sessionManagementStore', () => ({
      useSessionManagementStore: () => ({
        sessions: mockSessions,
        currentSession: mockSessions[0],
        isLoading: false,
        error: null,
        canLoadMore: false,
        fetchSessions: jest.fn(),
        loadMoreSessions: jest.fn(),
        selectSession: jest.fn(),
        setFilter: jest.fn(),
        clearSessions: jest.fn(),
        formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
      }),
      formatDate: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Sessions />)
    
    expect(screen.getByText('Session Details')).toBeInTheDocument()
    expect(screen.getByText(`Session ID: ${mockSessions[0].id}`)).toBeInTheDocument()
    expect(screen.getByText(`App Name: ${mockSessions[0].appName}`)).toBeInTheDocument()
    expect(screen.getByText(`User ID: ${mockSessions[0].userId}`)).toBeInTheDocument()
    expect(screen.getByText('Events: 0')).toBeInTheDocument()
  })

  test('calls fetchSessions on mount', () => {
    const { fetchSessions } = require('../stores/sessionManagementStore').useSessionManagementStore()
    
    render(<Sessions />)
    expect(fetchSessions).toHaveBeenCalledWith('test-user', 'test-app')
  })

  test('calls clearSessions on unmount', () => {
    const { clearSessions } = require('../stores/sessionManagementStore').useSessionManagementStore()
    
    const { unmount } = render(<Sessions />)
    unmount()
    
    expect(clearSessions).toHaveBeenCalled()
  })

  test('matches snapshot', () => {
    const { asFragment } = render(<Sessions />)
    expect(asFragment()).toMatchSnapshot()
  })
})