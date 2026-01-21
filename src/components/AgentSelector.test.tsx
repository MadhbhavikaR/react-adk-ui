import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AgentSelector } from './AgentSelector'

// Mock the Zustand store
const mockUseAgentStore = (state: any) => {
  const mockState = {
    agents: ['agent1', 'agent2', 'agent3'],
    currentAgent: null,
    isLoading: false,
    error: null,
    fetchAgents: jest.fn(),
    setCurrentAgent: jest.fn(),
    ...state
  }
  
  // Mock the Zustand hook
  jest.mock('../stores/agentStore', () => ({
    useAgentStore: () => mockState
  }))
  
  return mockState
}

describe('AgentSelector Component', () => {
  let mockState: any

  beforeEach(() => {
    mockState = mockUseAgentStore({})
    mockState.fetchAgents.mockClear()
    mockState.setCurrentAgent.mockClear()
  })

  test('renders agent selector dropdown', () => {
    render(<AgentSelector />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Select an agent')).toBeInTheDocument()
  })

  test('renders all agents as options', () => {
    render(<AgentSelector />)
    mockState.agents.forEach((agent: string) => {
      expect(screen.getByText(agent)).toBeInTheDocument()
    })
  })

  test('calls fetchAgents on mount', () => {
    render(<AgentSelector />)
    expect(mockState.fetchAgents).toHaveBeenCalledTimes(1)
  })

  test('calls setCurrentAgent when selection changes', () => {
    render(<AgentSelector />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'agent2' } })
    
    expect(mockState.setCurrentAgent).toHaveBeenCalledWith('agent2')
  })

  test('shows loading state when isLoading is true', () => {
    mockState = mockUseAgentStore({ isLoading: true, agents: [] })
    
    render(<AgentSelector />)
    expect(screen.getByText('Loading agents...')).toBeInTheDocument()
  })

  test('shows error state when error exists', () => {
    mockState = mockUseAgentStore({ error: 'Failed to load agents' })
    
    render(<AgentSelector />)
    expect(screen.getByText('Failed to load agents')).toBeInTheDocument()
  })

  test('sets selected agent when currentAgent is provided', () => {
    mockState = mockUseAgentStore({ currentAgent: 'agent2' })
    
    render(<AgentSelector />)
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('agent2')
  })

  test('applies correct CSS class', () => {
    render(<AgentSelector />)
    const select = screen.getByRole('combobox')
    expect(select).toHaveClass('agent-selector')
  })

  test('matches snapshot', () => {
    const { asFragment } = render(<AgentSelector />)
    expect(asFragment()).toMatchSnapshot()
  })
})