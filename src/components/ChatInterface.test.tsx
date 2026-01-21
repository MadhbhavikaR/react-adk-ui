import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChatInterface } from './ChatInterface'
import { MessageList } from './MessageList'

// Mock the child components
jest.mock('./MessageList', () => ({
  MessageList: () => <div data-testid="message-list">Message List</div>
}))

// Mock the stores and services
jest.mock('../stores/agentStore', () => ({
  useAgentStore: () => ({
    currentAgent: 'test-agent'
  })
}))

jest.mock('../stores/sessionStore', () => ({
  useSessionStore: () => ({
    sessionId: 'test-session',
    addEvent: jest.fn()
  })
}))

jest.mock('../services/eventStream', () => ({
  streamEvents: jest.fn(() => () => {})
}))

describe('ChatInterface Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders chat interface with input and button', () => {
    render(<ChatInterface />)
    
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument()
    expect(screen.getByText('Send')).toBeInTheDocument()
    expect(screen.getByTestId('message-list')).toBeInTheDocument()
  })

  test('renders MessageList component', () => {
    render(<ChatInterface />)
    expect(screen.getByTestId('message-list')).toBeInTheDocument()
  })

  test('input field updates message state', () => {
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message...')
    
    fireEvent.change(input, { target: { value: 'Hello, world!' } })
    expect(input).toHaveValue('Hello, world!')
  })

  test('send button is disabled when no agent is selected', () => {
    jest.mock('../stores/agentStore', () => ({
      useAgentStore: () => ({
        currentAgent: null
      })
    }))
    
    render(<ChatInterface />)
    const sendButton = screen.getByText('Send')
    expect(sendButton).toBeDisabled()
  })

  test('send button is disabled when message is empty', () => {
    render(<ChatInterface />)
    const sendButton = screen.getByText('Send')
    expect(sendButton).toBeDisabled()
  })

  test('send button is enabled when agent and message are present', () => {
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Test message' } })
    
    const sendButton = screen.getByText('Send')
    expect(sendButton).not.toBeDisabled()
  })

  test('calls handleSend when send button is clicked', () => {
    const { streamEvents } = require('../services/eventStream')
    const { addEvent } = require('../stores/sessionStore').useSessionStore()
    
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Test message' } })
    
    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)
    
    expect(streamEvents).toHaveBeenCalled()
    expect(input).toHaveValue('')
  })

  test('calls handleSend when Enter key is pressed', () => {
    const { streamEvents } = require('../services/eventStream')
    
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Test message' } })
    
    fireEvent.keyPress(input, { key: 'Enter', charCode: 13 })
    
    expect(streamEvents).toHaveBeenCalled()
    expect(input).toHaveValue('')
  })

  test('does not call handleSend when non-Enter key is pressed', () => {
    const { streamEvents } = require('../services/eventStream')
    
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message...')
    fireEvent.change(input, { target: { value: 'Test message' } })
    
    fireEvent.keyPress(input, { key: 'Shift', charCode: 16 })
    
    expect(streamEvents).not.toHaveBeenCalled()
  })

  test('applies correct CSS classes', () => {
    render(<ChatInterface />)
    
    const chatInterface = screen.getByTestId('chat-interface')
    expect(chatInterface).toHaveClass('chat-interface')
    
    const inputArea = screen.getByTestId('input-area')
    expect(inputArea).toHaveClass('input-area')
  })

  test('matches snapshot', () => {
    const { asFragment } = render(<ChatInterface />)
    expect(asFragment()).toMatchSnapshot()
  })
})