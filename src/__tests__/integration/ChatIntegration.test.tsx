import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChatInterface } from '../../components/ChatInterface'
import { MessageList } from '../../components/MessageList'
import { useSessionStore } from '../../stores/sessionStore'
import { useAgentStore } from '../../stores/agentStore'

// Mock the stores
jest.mock('../../stores/sessionStore', () => ({
  useSessionStore: () => ({
    sessionId: 'test-session',
    events: [],
    addEvent: jest.fn()
  })
}))

jest.mock('../../stores/agentStore', () => ({
  useAgentStore: () => ({
    currentAgent: 'test-agent'
  })
}))

jest.mock('../../services/eventStream', () => ({
  streamEvents: jest.fn(() => () => {})
}))

describe('Chat Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('ChatInterface and MessageList integrate correctly', () => {
    render(
      <div>
        <ChatInterface />
        <MessageList />
      </div>
    )
    
    // Both components should be rendered
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
    expect(screen.getByText('No messages yet. Start a conversation!')).toBeInTheDocument()
  })

  test('sending message updates session store', () => {
    const { addEvent } = require('../../stores/sessionStore').useSessionStore()
    
    render(
      <div>
        <ChatInterface />
        <MessageList />
      </div>
    )
    
    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Hello, world!' } })
    
    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)
    
    // Should call addEvent through the event stream
    const { streamEvents } = require('../../services/eventStream')
    expect(streamEvents).toHaveBeenCalled()
  })

  test('message list updates when events are added to store', () => {
    const mockEvents = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ]
    
    // Mock the store to return events
    jest.mock('../../stores/sessionStore', () => ({
      useSessionStore: () => ({
        sessionId: 'test-session',
        events: mockEvents,
        addEvent: jest.fn()
      })
    }))
    
    render(
      <div>
        <ChatInterface />
        <MessageList />
      </div>
    )
    
    // Message list should show the events
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
  })

  test('send button is disabled when no agent is selected', () => {
    // Mock store with no agent
    jest.mock('../../stores/agentStore', () => ({
      useAgentStore: () => ({
        currentAgent: null
      })
    }))
    
    render(
      <div>
        <ChatInterface />
        <MessageList />
      </div>
    )
    
    const sendButton = screen.getByText('Send')
    expect(sendButton).toBeDisabled()
  })

  test('send button is disabled when message is empty', () => {
    render(
      <div>
        <ChatInterface />
        <MessageList />
      </div>
    )
    
    const sendButton = screen.getByText('Send')
    expect(sendButton).toBeDisabled()
  })

  test('send button is enabled when both agent and message are present', () => {
    render(
      <div>
        <ChatInterface />
        <MessageList />
      </div>
    )
    
    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Test message' } })
    
    const sendButton = screen.getByText('Send')
    expect(sendButton).not.toBeDisabled()
  })

  test('message input clears after sending', () => {
    render(
      <div>
        <ChatInterface />
        <MessageList />
      </div>
    )
    
    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Test message' } })
    
    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)
    
    expect(input).toHaveValue('')
  })

  test('Enter key triggers message sending', () => {
    const { streamEvents } = require('../../services/eventStream')
    
    render(
      <div>
        <ChatInterface />
        <MessageList />
      </div>
    )
    
    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Test message' } })
    
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 })
    
    expect(streamEvents).toHaveBeenCalled()
  })
})