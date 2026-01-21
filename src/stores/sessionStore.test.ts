import { act, renderHook } from '@testing-library/react'
import { useSessionStore } from './sessionStore'

describe('Session Store', () => {
  beforeEach(() => {
    // Clear the store state before each test
    const { result } = renderHook(() => useSessionStore())
    act(() => {
      result.current.clearEvents()
    })
  })

  test('initial state is correct', () => {
    const { result } = renderHook(() => useSessionStore())
    
    expect(result.current.events).toEqual([])
    expect(result.current.sessionId).toBe('')
  })

  test('addEvent adds event to events array', () => {
    const { result } = renderHook(() => useSessionStore())
    
    const testEvent = { role: 'user', content: 'Hello' }
    
    act(() => {
      result.current.addEvent(testEvent)
    })
    
    expect(result.current.events).toEqual([testEvent])
  })

  test('addEvent adds multiple events', () => {
    const { result } = renderHook(() => useSessionStore())
    
    const event1 = { role: 'user', content: 'Hello' }
    const event2 = { role: 'assistant', content: 'Hi there!' }
    
    act(() => {
      result.current.addEvent(event1)
      result.current.addEvent(event2)
    })
    
    expect(result.current.events).toEqual([event1, event2])
  })

  test('clearEvents clears all events', () => {
    const { result } = renderHook(() => useSessionStore())
    
    // Add some events
    act(() => {
      result.current.addEvent({ role: 'user', content: 'Hello' })
      result.current.addEvent({ role: 'assistant', content: 'Hi' })
    })
    
    // Clear events
    act(() => {
      result.current.clearEvents()
    })
    
    expect(result.current.events).toEqual([])
  })

  test('startSession generates new session ID', () => {
    const { result } = renderHook(() => useSessionStore())
    
    act(() => {
      result.current.startSession()
    })
    
    expect(result.current.sessionId).toMatch(/^session_\d+$/)
    expect(result.current.isStreaming).toBe(true)
    expect(result.current.events).toEqual([])
  })

  test('multiple store instances share the same state', () => {
    const { result: result1 } = renderHook(() => useSessionStore())
    const { result: result2 } = renderHook(() => useSessionStore())
    
    // Update state through first instance
    act(() => {
      result1.current.addEvent({ role: 'user', content: 'Test' })
    })
    
    // Both instances should reflect the change
    expect(result1.current.events.length).toBe(1)
    expect(result2.current.events.length).toBe(1)
  })

  test('store maintains state between renders', () => {
    const { result, rerender } = renderHook(() => useSessionStore())
    
    // Set initial state
    act(() => {
      result.current.addEvent({ role: 'user', content: 'Hello' })
      result.current.startSession()
    })
    
    // Rerender the hook
    rerender()
    
    // State should be preserved
    expect(result.current.events.length).toBe(1)
    expect(result.current.sessionId).toMatch(/^session_\d+$/)
  })

  test('can handle complex event objects', () => {
    const { result } = renderHook(() => useSessionStore())
    
    const complexEvent = {
      role: 'function',
      name: 'test_function',
      arguments: { param1: 'value1', param2: 123 },
      result: { success: true }
    }
    
    act(() => {
      result.current.addEvent(complexEvent)
    })
    
    expect(result.current.events).toEqual([complexEvent])
  })

  test('store functions are stable between renders', () => {
    const { result, rerender } = renderHook(() => useSessionStore())
    
    const initialAddEvent = result.current.addEvent
    const initialClearEvents = result.current.clearEvents
    
    // Rerender the hook
    rerender()
    
    // Functions should be the same reference (stable)
    expect(result.current.addEvent).toBe(initialAddEvent)
    expect(result.current.clearEvents).toBe(initialClearEvents)
  })
})