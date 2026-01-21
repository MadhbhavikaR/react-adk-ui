import { act, renderHook } from '@testing-library/react'
import { useAgentStore } from './agentStore'

describe('Agent Store', () => {
  beforeEach(() => {
    // Clear the store state before each test
    const { result } = renderHook(() => useAgentStore())
    act(() => {
      result.current.setCurrentAgent(null as any)
    })
  })

  test('initial state is correct', () => {
    const { result } = renderHook(() => useAgentStore())
    
    expect(result.current.agents).toEqual([])
    expect(result.current.currentAgent).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test('setCurrentAgent updates current agent', () => {
    const { result } = renderHook(() => useAgentStore())
    
    act(() => {
      result.current.setCurrentAgent('agent1')
    })
    
    expect(result.current.currentAgent).toBe('agent1')
  })

  test('setCurrentAgent with empty string clears current agent', () => {
    const { result } = renderHook(() => useAgentStore())
    
    // Set an agent first
    act(() => {
      result.current.setCurrentAgent('agent1')
    })
    
    // Clear it
    act(() => {
      result.current.setCurrentAgent('')
    })
    
    expect(result.current.currentAgent).toBe('')
  })

  test('multiple store instances share the same state', () => {
    const { result: result1 } = renderHook(() => useAgentStore())
    const { result: result2 } = renderHook(() => useAgentStore())
    
    // Update state through first instance
    act(() => {
      result1.current.setCurrentAgent('agent1')
    })
    
    // Both instances should reflect the change
    expect(result1.current.currentAgent).toBe('agent1')
    expect(result2.current.currentAgent).toBe('agent1')
  })

  test('store maintains state between renders', () => {
    const { result, rerender } = renderHook(() => useAgentStore())
    
    // Set initial state
    act(() => {
      result.current.setCurrentAgent('agent1')
    })
    
    // Rerender the hook
    rerender()
    
    // State should be preserved
    expect(result.current.currentAgent).toBe('agent1')
  })

  test('can update agent multiple times', () => {
    const { result } = renderHook(() => useAgentStore())
    
    act(() => {
      result.current.setCurrentAgent('agent1')
    })
    
    act(() => {
      result.current.setCurrentAgent('agent2')
    })
    
    expect(result.current.currentAgent).toBe('agent2')
  })

  test('store functions are stable between renders', () => {
    const { result, rerender } = renderHook(() => useAgentStore())
    
    const initialSetCurrentAgent = result.current.setCurrentAgent
    const initialFetchAgents = result.current.fetchAgents
    
    // Rerender the hook
    rerender()
    
    // Functions should be the same reference (stable)
    expect(result.current.setCurrentAgent).toBe(initialSetCurrentAgent)
    expect(result.current.fetchAgents).toBe(initialFetchAgents)
  })
})