import { create } from 'zustand'

interface EvalMetric {
  name: string;
  description: string;
  threshold?: number;
}

interface EvalCase {
  id: string;
  name: string;
  description: string;
  sessionId: string;
}

interface EvaluationResult {
  setId: string;
  evalId: string;
  finalEvalStatus: number;
  evalMetricResults: any[];
  overallEvalMetricResults: any[];
  sessionId: string;
  sessionDetails: any;
}

interface EvaluationState {
  evalSets: any[];
  selectedEvalSet: string;
  evalCases: EvalCase[];
  selectedEvalCase: EvalCase | null;
  evalMetrics: EvalMetric[];
  evaluationResults: Map<string, EvaluationResult[]>;
  isLoading: boolean;
  error: string | null;
  evalRunning: boolean;
  fetchEvalSets: (appName: string) => Promise<void>;
  fetchEvalCases: (appName: string, evalSetId: string) => Promise<void>;
  fetchEvalCase: (appName: string, evalSetId: string, caseId: string) => Promise<void>;
  selectEvalSet: (setId: string) => void;
  selectEvalCase: (evalCase: EvalCase) => void;
  runEvaluation: (appName: string, evalSetId: string, caseIds: string[]) => Promise<void>;
  clearEvaluations: () => void;
}

const DEFAULT_EVAL_METRICS: EvalMetric[] = [
  {
    name: 'response_match_score',
    description: 'Measures how well the response matches expected output'
  },
  {
    name: 'tool_trajectory_avg_score',
    description: 'Evaluates the tool usage trajectory'
  },
  {
    name: 'safety_score',
    description: 'Assesses response safety and appropriateness'
  }
]

export const useEvaluationStore = create<EvaluationState>((set, get) => ({
  evalSets: [],
  selectedEvalSet: '',
  evalCases: [],
  selectedEvalCase: null,
  evalMetrics: DEFAULT_EVAL_METRICS,
  evaluationResults: new Map(),
  isLoading: false,
  error: null,
  evalRunning: false,

  fetchEvalSets: async (appName: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock data - in real implementation this would call an API
      const mockSets = [
        { id: 'set_1', name: 'Basic Functionality Tests', description: 'Tests for basic agent functionality' },
        { id: 'set_2', name: 'Edge Cases', description: 'Tests for edge cases and error handling' },
        { id: 'set_3', name: 'Performance Tests', description: 'Tests for performance and scalability' }
      ]
      
      set({ evalSets: mockSets, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch evaluation sets', isLoading: false });
    }
  },

  fetchEvalCases: async (appName: string, evalSetId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock data
      const mockCases: EvalCase[] = [
        {
          id: 'case_1',
          name: 'Greeting Test',
          description: 'Tests agent greeting response',
          sessionId: 'session_1'
        },
        {
          id: 'case_2',
          name: 'Error Handling Test',
          description: 'Tests agent error handling',
          sessionId: 'session_2'
        },
        {
          id: 'case_3',
          name: 'Complex Query Test',
          description: 'Tests agent with complex queries',
          sessionId: 'session_3'
        }
      ]
      
      set({ evalCases: mockCases, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch evaluation cases', isLoading: false });
    }
  },

  fetchEvalCase: async (appName: string, evalSetId: string, caseId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock data
      const mockCase: EvalCase = {
        id: caseId,
        name: `Test Case ${caseId}`,
        description: `Description for ${caseId}`,
        sessionId: 'session_1'
      }
      
      set({ selectedEvalCase: mockCase, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch evaluation case', isLoading: false });
    }
  },

  selectEvalSet: (setId: string) => {
    set({ selectedEvalSet: setId, evalCases: [], selectedEvalCase: null });
  },

  selectEvalCase: (evalCase: EvalCase) => {
    set({ selectedEvalCase: evalCase });
  },

  runEvaluation: async (appName: string, evalSetId: string, caseIds: string[]) => {
    if (caseIds.length === 0) {
      set({ error: 'No cases selected for evaluation', evalRunning: false });
      return;
    }
    
    set({ evalRunning: true, error: null });
    
    try {
      // Mock evaluation results
      const results: EvaluationResult[] = caseIds.map(caseId => ({
        setId: evalSetId,
        evalId: caseId,
        finalEvalStatus: Math.random() > 0.5 ? 1 : 2, // 1 = pass, 2 = fail
        evalMetricResults: get().evalMetrics.map(metric => ({
          metricName: metric.name,
          evalStatus: Math.random() > 0.5 ? 1 : 2,
          score: Math.random(),
          threshold: 0.7
        })),
        overallEvalMetricResults: [],
        sessionId: `session_${Math.floor(Math.random() * 3) + 1}`,
        sessionDetails: {}
      }))
      
      const currentResults = get().evaluationResults.get(evalSetId) || []
      const updatedResults = new Map(get().evaluationResults)
      updatedResults.set(evalSetId, [...currentResults, ...results])
      
      set({ 
        evaluationResults: updatedResults, 
        evalRunning: false 
      });
    } catch (error) {
      set({ 
        error: 'Failed to run evaluation', 
        evalRunning: false 
      });
    }
  },

  clearEvaluations: () => {
    set({
      evalSets: [],
      selectedEvalSet: '',
      evalCases: [],
      selectedEvalCase: null,
      evaluationResults: new Map(),
      error: null
    });
  }
}));

export const getEvalResultForCase = (
  evalSetId: string,
  caseId: string,
  evaluationResults: Map<string, EvaluationResult[]>
): number | undefined => {
  const results = evaluationResults.get(evalSetId)
  return results?.find(r => r.evalId === caseId)?.finalEvalStatus
}

export const formatTimestamp = (timestamp: number | string): string => {
  const numericTimestamp = Number(timestamp)
  
  if (isNaN(numericTimestamp)) {
    return 'Invalid timestamp'
  }
  
  const date = new Date(numericTimestamp * 1000)
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date)
}