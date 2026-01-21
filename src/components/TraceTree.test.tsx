import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import TraceTree from './TraceTree'

// Mock the trace store
jest.mock('../stores/traceStore', () => ({
  useTraceStore: () => ({
    selectedTraceRow: null,
    hoveredTraceRow: null,
    setSelectedTraceRow: jest.fn(),
    setHoveredTraceRow: jest.fn()
  })
}))

describe('TraceTree Component', () => {
  const mockSpans = [
    {
      span_id: 'span1',
      name: 'Invocation',
      start_time: 1000000000,
      end_time: 2000000000,
      attributes: {}
    },
    {
      span_id: 'span2',
      name: 'agent_run',
      start_time: 1500000000,
      end_time: 1800000000,
      parent_span_id: 'span1',
      attributes: {}
    },
    {
      span_id: 'span3',
      name: 'tool',
      start_time: 1600000000,
      end_time: 1700000000,
      parent_span_id: 'span2',
      attributes: { 'gcp.vertex.agent.event_id': 'event123' }
    }
  ]

  const mockInvocationId = 'invocation-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders trace tree container with invocation ID', () => {
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    expect(screen.getByText('Invocation ID:')).toBeInTheDocument()
    expect(screen.getByText(mockInvocationId)).toBeInTheDocument()
  })

  test('renders all spans as trace rows', () => {
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    const traceRows = screen.getAllByTestId('trace-row')
    expect(traceRows.length).toBe(3)
  })

  test('displays span names correctly', () => {
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    expect(screen.getByText('Invocation')).toBeInTheDocument()
    expect(screen.getByText('agent_run')).toBeInTheDocument()
    expect(screen.getByText('tool')).toBeInTheDocument()
  })

  test('applies correct indentation for nested spans', () => {
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    const traceRows = screen.getAllByTestId('trace-row')
    
    // First span (root) should have level 0
    const firstRowIndent = traceRows[0].querySelectorAll('.indent-connector')
    expect(firstRowIndent.length).toBe(0)
    
    // Second span (child of first) should have level 1
    const secondRowIndent = traceRows[1].querySelectorAll('.indent-connector')
    expect(secondRowIndent.length).toBe(1)
    
    // Third span (child of second) should have level 2
    const thirdRowIndent = traceRows[2].querySelectorAll('.indent-connector')
    expect(thirdRowIndent.length).toBe(2)
  })

  test('displays correct span durations', () => {
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    // Span1: 1000ms duration
    expect(screen.getByText('1000.00ms')).toBeInTheDocument()
    
    // Span2: 300ms duration  
    expect(screen.getByText('300.00ms')).toBeInTheDocument()
    
    // Span3: 100ms duration
    expect(screen.getByText('100.00ms')).toBeInTheDocument()
  })

  test('applies correct icon classes based on span names', () => {
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    const icons = screen.getAllByTestId('span-icon')
    expect(icons[0]).toHaveTextContent('start') // Invocation -> start
    expect(icons[1]).toHaveTextContent('robot') // agent_run -> robot
    expect(icons[2]).toHaveTextContent('build') // tool -> build
  })

  test('marks event rows correctly', () => {
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    const eventRows = screen.getAllByTestId('event-row')
    expect(eventRows.length).toBe(1) // Only span3 has event_id
    expect(eventRows[0]).toHaveTextContent('tool')
  })

  test('calls setSelectedTraceRow when row is clicked', () => {
    const { setSelectedTraceRow } = require('../stores/traceStore').useTraceStore()
    
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    const traceRows = screen.getAllByTestId('trace-row')
    fireEvent.click(traceRows[0])
    
    expect(setSelectedTraceRow).toHaveBeenCalledWith(mockSpans[0])
  })

  test('toggles selection when clicking same row twice', () => {
    const { setSelectedTraceRow } = require('../stores/traceStore').useTraceStore()
    
    // Mock the store to return the first span as selected
    jest.mock('../stores/traceStore', () => ({
      useTraceStore: () => ({
        selectedTraceRow: mockSpans[0],
        hoveredTraceRow: null,
        setSelectedTraceRow: jest.fn(),
        setHoveredTraceRow: jest.fn()
      })
    }))
    
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    const traceRows = screen.getAllByTestId('trace-row')
    fireEvent.click(traceRows[0])
    
    expect(setSelectedTraceRow).toHaveBeenCalledWith(null)
  })

  test('calls setHoveredTraceRow on mouse enter and leave', () => {
    const { setHoveredTraceRow } = require('../stores/traceStore').useTraceStore()
    
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    const traceRows = screen.getAllByTestId('trace-row')
    
    // Mouse enter
    fireEvent.mouseEnter(traceRows[0])
    expect(setHoveredTraceRow).toHaveBeenCalledWith(mockSpans[0])
    
    // Mouse leave
    fireEvent.mouseLeave(traceRows[0])
    expect(setHoveredTraceRow).toHaveBeenCalledWith(null)
  })

  test('applies selected class to selected row', () => {
    // Mock the store to return the first span as selected
    jest.mock('../stores/traceStore', () => ({
      useTraceStore: () => ({
        selectedTraceRow: mockSpans[0],
        hoveredTraceRow: null,
        setSelectedTraceRow: jest.fn(),
        setHoveredTraceRow: jest.fn()
      })
    }))
    
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    const traceRows = screen.getAllByTestId('trace-row')
    expect(traceRows[0]).toHaveClass('selected')
    expect(traceRows[1]).not.toHaveClass('selected')
  })

  test('calculates correct relative positions and widths', () => {
    render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    
    const traceBars = screen.getAllByTestId('trace-bar')
    
    // Span1: starts at 0%, width 100%
    expect(traceBars[0]).toHaveStyle('left: 0%')
    expect(traceBars[0]).toHaveStyle('width: 100%')
    
    // Span2: starts at 50%, width 30%
    expect(traceBars[1]).toHaveStyle('left: 50%')
    expect(traceBars[1]).toHaveStyle('width: 30%')
    
    // Span3: starts at 60%, width 10%
    expect(traceBars[2]).toHaveStyle('left: 60%')
    expect(traceBars[2]).toHaveStyle('width: 10%')
  })

  test('handles empty spans array', () => {
    render(<TraceTree spans={[]} invocationId={mockInvocationId} />)
    
    expect(screen.getByText('Invocation ID:')).toBeInTheDocument()
    expect(screen.getByText(mockInvocationId)).toBeInTheDocument()
    expect(screen.queryByTestId('trace-row')).not.toBeInTheDocument()
  })

  test('matches snapshot', () => {
    const { asFragment } = render(<TraceTree spans={mockSpans} invocationId={mockInvocationId} />)
    expect(asFragment()).toMatchSnapshot()
  })
})