import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Evaluations from './Evaluations'

// Mock the evaluation store
jest.mock('../stores/evaluationStore', () => ({
  useEvaluationStore: () => ({
    evalSets: [],
    selectedEvalSet: null,
    evalCases: [],
    selectedEvalCase: null,
    evalMetrics: [],
    evaluationResults: new Map(),
    isLoading: false,
    error: null,
    evalRunning: false,
    fetchEvalSets: jest.fn(),
    fetchEvalCases: jest.fn(),
    selectEvalSet: jest.fn(),
    selectEvalCase: jest.fn(),
    runEvaluation: jest.fn(),
    clearEvaluations: jest.fn(),
    getEvalResultForCase: jest.fn()
  }),
  getEvalResultForCase: jest.fn(),
  formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
}))

describe('Evaluations Page', () => {
  const mockEvalSets = [
    { id: 'set1', name: 'Test Set 1' },
    { id: 'set2', name: 'Test Set 2' }
  ]

  const mockEvalCases = [
    { id: 'case1', name: 'Test Case 1', description: 'First test case', sessionId: 'session1' },
    { id: 'case2', name: 'Test Case 2', description: 'Second test case', sessionId: 'session2' }
  ]

  const mockEvalMetrics = [
    { name: 'accuracy', description: 'Measures accuracy' },
    { name: 'latency', description: 'Measures response time' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders evaluations page with title', () => {
    render(<Evaluations />)
    expect(screen.getByText('Evaluations')).toBeInTheDocument()
  })

  test('renders evaluation set selector', () => {
    render(<Evaluations />)
    expect(screen.getByLabelText('Evaluation Set:')).toBeInTheDocument()
    expect(screen.getByText('Select an evaluation set')).toBeInTheDocument()
  })

  test('shows loading state when loading', () => {
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: [],
        selectedEvalSet: null,
        evalCases: [],
        selectedEvalCase: null,
        evalMetrics: [],
        evaluationResults: new Map(),
        isLoading: true,
        error: null,
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: jest.fn(),
        selectEvalCase: jest.fn(),
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn()
      }),
      getEvalResultForCase: jest.fn(),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    expect(screen.getByText('Loading evaluation cases...')).toBeInTheDocument()
  })

  test('shows error message when error occurs', () => {
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: [],
        selectedEvalSet: null,
        evalCases: [],
        selectedEvalCase: null,
        evalMetrics: [],
        evaluationResults: new Map(),
        isLoading: false,
        error: 'Failed to load evaluations',
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: jest.fn(),
        selectEvalCase: jest.fn(),
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn()
      }),
      getEvalResultForCase: jest.fn(),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    expect(screen.getByText('Error: Failed to load evaluations')).toBeInTheDocument()
  })

  test('renders all evaluation sets in dropdown', () => {
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: mockEvalSets,
        selectedEvalSet: null,
        evalCases: [],
        selectedEvalCase: null,
        evalMetrics: [],
        evaluationResults: new Map(),
        isLoading: false,
        error: null,
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: jest.fn(),
        selectEvalCase: jest.fn(),
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn()
      }),
      getEvalResultForCase: jest.fn(),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    
    mockEvalSets.forEach(set => {
      expect(screen.getByText(set.name)).toBeInTheDocument()
    })
  })

  test('calls selectEvalSet when evaluation set is selected', () => {
    const { selectEvalSet } = require('../stores/evaluationStore').useEvaluationStore()
    
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: mockEvalSets,
        selectedEvalSet: null,
        evalCases: [],
        selectedEvalCase: null,
        evalMetrics: [],
        evaluationResults: new Map(),
        isLoading: false,
        error: null,
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: selectEvalSet,
        selectEvalCase: jest.fn(),
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn()
      }),
      getEvalResultForCase: jest.fn(),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'set1' } })
    
    expect(selectEvalSet).toHaveBeenCalledWith('set1')
  })

  test('shows run evaluation button when evaluation set is selected', () => {
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: mockEvalSets,
        selectedEvalSet: 'set1',
        evalCases: [],
        selectedEvalCase: null,
        evalMetrics: [],
        evaluationResults: new Map(),
        isLoading: false,
        error: null,
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: jest.fn(),
        selectEvalCase: jest.fn(),
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn()
      }),
      getEvalResultForCase: jest.fn(),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    expect(screen.getByText('Run Evaluation')).toBeInTheDocument()
  })

  test('run evaluation button is disabled when no cases are selected', () => {
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: mockEvalSets,
        selectedEvalSet: 'set1',
        evalCases: mockEvalCases,
        selectedEvalCase: null,
        evalMetrics: [],
        evaluationResults: new Map(),
        isLoading: false,
        error: null,
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: jest.fn(),
        selectEvalCase: jest.fn(),
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn()
      }),
      getEvalResultForCase: jest.fn(),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    const runButton = screen.getByText('Run Evaluation')
    expect(runButton).toBeDisabled()
  })

  test('shows empty state when no evaluation cases', () => {
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: mockEvalSets,
        selectedEvalSet: 'set1',
        evalCases: [],
        selectedEvalCase: null,
        evalMetrics: [],
        evaluationResults: new Map(),
        isLoading: false,
        error: null,
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: jest.fn(),
        selectEvalCase: jest.fn(),
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn()
      }),
      getEvalResultForCase: jest.fn(),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    expect(screen.getByText('No evaluation cases found')).toBeInTheDocument()
  })

  test('renders all evaluation cases when evaluation set is selected', () => {
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: mockEvalSets,
        selectedEvalSet: 'set1',
        evalCases: mockEvalCases,
        selectedEvalCase: null,
        evalMetrics: [],
        evaluationResults: new Map(),
        isLoading: false,
        error: null,
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: jest.fn(),
        selectEvalCase: jest.fn(),
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn(() => ({ status: 1 }))
      }),
      getEvalResultForCase: jest.fn(() => ({ status: 1 })),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    
    mockEvalCases.forEach(evalCase => {
      expect(screen.getByText(evalCase.name)).toBeInTheDocument()
      expect(screen.getByText(evalCase.description)).toBeInTheDocument()
    })
  })

  test('calls selectEvalCase when case is clicked', () => {
    const { selectEvalCase } = require('../stores/evaluationStore').useEvaluationStore()
    
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: mockEvalSets,
        selectedEvalSet: 'set1',
        evalCases: mockEvalCases,
        selectedEvalCase: null,
        evalMetrics: [],
        evaluationResults: new Map(),
        isLoading: false,
        error: null,
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: jest.fn(),
        selectEvalCase: selectEvalCase,
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn(() => ({ status: 1 }))
      }),
      getEvalResultForCase: jest.fn(() => ({ status: 1 })),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    
    const caseItems = screen.getAllByTestId('eval-case-item')
    fireEvent.click(caseItems[0])
    
    expect(selectEvalCase).toHaveBeenCalledWith(mockEvalCases[0])
  })

  test('shows evaluation case details when case is selected', () => {
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: mockEvalSets,
        selectedEvalSet: 'set1',
        evalCases: mockEvalCases,
        selectedEvalCase: mockEvalCases[0],
        evalMetrics: mockEvalMetrics,
        evaluationResults: new Map(),
        isLoading: false,
        error: null,
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: jest.fn(),
        selectEvalCase: jest.fn(),
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn(() => ({ status: 1 }))
      }),
      getEvalResultForCase: jest.fn(() => ({ status: 1 })),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    
    expect(screen.getByText('Evaluation Case Details')).toBeInTheDocument()
    expect(screen.getByText(`Case ID: ${mockEvalCases[0].id}`)).toBeInTheDocument()
    expect(screen.getByText(`Name: ${mockEvalCases[0].name}`)).toBeInTheDocument()
    expect(screen.getByText(`Session ID: ${mockEvalCases[0].sessionId}`)).toBeInTheDocument()
  })

  test('shows evaluation metrics when case is selected', () => {
    jest.mock('../stores/evaluationStore', () => ({
      useEvaluationStore: () => ({
        evalSets: mockEvalSets,
        selectedEvalSet: 'set1',
        evalCases: mockEvalCases,
        selectedEvalCase: mockEvalCases[0],
        evalMetrics: mockEvalMetrics,
        evaluationResults: new Map(),
        isLoading: false,
        error: null,
        evalRunning: false,
        fetchEvalSets: jest.fn(),
        fetchEvalCases: jest.fn(),
        selectEvalSet: jest.fn(),
        selectEvalCase: jest.fn(),
        runEvaluation: jest.fn(),
        clearEvaluations: jest.fn(),
        getEvalResultForCase: jest.fn(() => ({ status: 1 }))
      }),
      getEvalResultForCase: jest.fn(() => ({ status: 1 })),
      formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString()
    }))
    
    render(<Evaluations />)
    
    mockEvalMetrics.forEach(metric => {
      expect(screen.getByText(metric.name)).toBeInTheDocument()
      expect(screen.getByText(metric.description)).toBeInTheDocument()
    })
  })

  test('calls fetchEvalSets on mount', () => {
    const { fetchEvalSets } = require('../stores/evaluationStore').useEvaluationStore()
    
    render(<Evaluations />)
    expect(fetchEvalSets).toHaveBeenCalledWith('test-app')
  })

  test('calls clearEvaluations on unmount', () => {
    const { clearEvaluations } = require('../stores/evaluationStore').useEvaluationStore()
    
    const { unmount } = render(<Evaluations />)
    unmount()
    
    expect(clearEvaluations).toHaveBeenCalled()
  })

  test('matches snapshot', () => {
    const { asFragment } = render(<Evaluations />)
    expect(asFragment()).toMatchSnapshot()
  })
})