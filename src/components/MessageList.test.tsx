import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MessageList } from './MessageList'

// Mock the session store
jest.mock('../stores/sessionStore', () => ({
  useSessionStore: () => ({
    events: []
  })
}))

describe('MessageList Component', () => {
  const mockEvents = [
    { role: 'user', content: 'Hello there!' },
    { role: 'assistant', content: 'Hi! How can I help you?' },
    { role: 'system', content: 'Session started' },
    { role: 'function', content: 'Function call executed' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('shows empty state when no messages', () => {
    render(<MessageList />)
    expect(screen.getByText('No messages yet. Start a conversation!')).toBeInTheDocument()
  })

  test('renders all messages with correct roles', () => {
    jest.mock('../stores/sessionStore', () => ({
      useSessionStore: () => ({
        events: mockEvents
      })
    }))
    
    render(<MessageList />)
    
    mockEvents.forEach(event => {
      expect(screen.getByText(event.content)).toBeInTheDocument()
    })
  })

  test('applies correct CSS classes for different message roles', () => {
    jest.mock('../stores/sessionStore', () => ({
      useSessionStore: () => ({
        events: mockEvents
      })
    }))
    
    render(<MessageList />)
    
    mockEvents.forEach(event => {
      const messageElement = screen.getByText(event.content).closest('.message')
      expect(messageElement).toHaveClass(`message ${event.role || 'system'}`)
    })
  })

  test('handles events without content gracefully', () => {
    const eventsWithComplexData = [
      { role: 'function', data: { result: 'success' } },
      { role: 'system', metadata: { timestamp: '2023-01-01' } }
    ]
    
    jest.mock('../stores/sessionStore', () => ({
      useSessionStore: () => ({
        events: eventsWithComplexData
      })
    }))
    
    render(<MessageList />)
    
    // Should render JSON stringified content
    expect(screen.getByText(/"result":"success"/)).toBeInTheDocument()
    expect(screen.getByText(/"timestamp":"2023-01-01"/)).toBeInTheDocument()
  })

  test('applies correct CSS class to message list container', () => {
    jest.mock('../stores/sessionStore', () => ({
      useSessionStore: () => ({
        events: mockEvents
      })
    }))
    
    render(<MessageList />)
    
    const messageList = screen.getByTestId('message-list')
    expect(messageList).toHaveClass('message-list')
  })

  test('renders messages in correct order', () => {
    jest.mock('../stores/sessionStore', () => ({
      useSessionStore: () => ({
        events: mockEvents
      })
    }))
    
    render(<MessageList />)
    
    const messages = screen.getAllByTestId('message')
    expect(messages.length).toBe(mockEvents.length)
    
    // Check order by comparing text content
    messages.forEach((message, index) => {
      expect(message).toHaveTextContent(mockEvents[index].content)
    })
  })

  test('matches snapshot with messages', () => {
    jest.mock('../stores/sessionStore', () => ({
      useSessionStore: () => ({
        events: mockEvents
      })
    }))
    
    const { asFragment } = render(<MessageList />)
    expect(asFragment()).toMatchSnapshot()
  })

  test('matches snapshot when empty', () => {
    const { asFragment } = render(<MessageList />)
    expect(asFragment()).toMatchSnapshot()
  })
})