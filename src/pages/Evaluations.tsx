import { useEffect, useState } from 'react'
import { useEvaluationStore, getEvalResultForCase, formatTimestamp } from '../stores/evaluationStore'
import './Evaluations.css'

export default function Evaluations() {
  const [appName] = useState('test-app')
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  
  const {
    evalSets,
    selectedEvalSet,
    evalCases,
    selectedEvalCase,
    evalMetrics,
    evaluationResults,
    isLoading,
    error,
    evalRunning,
    fetchEvalSets,
    fetchEvalCases,
    selectEvalSet,
    selectEvalCase,
    runEvaluation,
    clearEvaluations
  } = useEvaluationStore()

  useEffect(() => {
    fetchEvalSets(appName)
    
    return () => {
      clearEvaluations()
    }
  }, [fetchEvalSets, appName, clearEvaluations])

  useEffect(() => {
    if (selectedEvalSet) {
      fetchEvalCases(appName, selectedEvalSet)
    }
  }, [selectedEvalSet, fetchEvalCases, appName])

  const handleEvalSetSelect = (setId: string) => {
    selectEvalSet(setId)
    setSelectedCases([])
    setSelectAll(false)
  }

  const handleCaseSelect = (caseId: string) => {
    const newSelectedCases = selectedCases.includes(caseId)
      ? selectedCases.filter(id => id !== caseId)
      : [...selectedCases, caseId]
    
    setSelectedCases(newSelectedCases)
    setSelectAll(newSelectedCases.length === evalCases.length)
  }

  const handleSelectAll = () => {
    const newSelectAll = !selectAll
    setSelectAll(newSelectAll)
    setSelectedCases(newSelectAll ? evalCases.map(c => c.id) : [])
  }

  const handleRunEvaluation = () => {
    if (selectedCases.length === 0) {
      alert('Please select at least one case to evaluate')
      return
    }
    
    runEvaluation(appName, selectedEvalSet, selectedCases)
  }

  const handleCaseClick = (evalCase: any) => {
    selectEvalCase(evalCase)
  }

  const getEvalStatusText = (status?: number) => {
    switch (status) {
      case 1: return 'Pass'
      case 2: return 'Fail'
      default: return 'Not Evaluated'
    }
  }

  const getEvalStatusClass = (status?: number) => {
    switch (status) {
      case 1: return 'status-pass'
      case 2: return 'status-fail'
      default: return 'status-pending'
    }
  }

  return (
    <div className="evaluations-page">
      <h2>Evaluations</h2>
      
      <div className="eval-controls">
        <div className="eval-set-selector">
          <label htmlFor="eval-set-select">Evaluation Set:</label>
          <select
            id="eval-set-select"
            value={selectedEvalSet}
            onChange={(e) => handleEvalSetSelect(e.target.value)}
            className="eval-set-select"
          >
            <option value="">Select an evaluation set</option>
            {evalSets.map(set => (
              <option key={set.id} value={set.id}>{set.name}</option>
            ))}
          </select>
        </div>
        
        {selectedEvalSet && (
          <button
            onClick={handleRunEvaluation}
            className="run-eval-button"
            disabled={evalRunning || selectedCases.length === 0}
          >
            {evalRunning ? 'Running...' : 'Run Evaluation'}
          </button>
        )}
      </div>

      {isLoading && evalCases.length === 0 ? (
        <div className="loading-indicator">Loading evaluation cases...</div>
      ) : error ? (
        <div className="error-message">Error: {error}</div>
      ) : selectedEvalSet && evalCases.length === 0 ? (
        <div className="empty-state">No evaluation cases found</div>
      ) : selectedEvalSet && (
        <div className="eval-cases-section">
          <div className="eval-cases-header">
            <div className="eval-cases-title">Evaluation Cases</div>
            <div className="eval-cases-actions">
              <label>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  disabled={evalCases.length === 0}
                />
                Select All
              </label>
            </div>
          </div>

          <div className="eval-cases-list">
            {evalCases.map(evalCase => {
              const evalStatus = getEvalResultForCase(
                selectedEvalSet, 
                evalCase.id, 
                evaluationResults
              )

              return (
                <div
                  key={evalCase.id}
                  className={`eval-case-item ${selectedEvalCase?.id === evalCase.id ? 'selected' : ''}`}
                  onClick={() => handleCaseClick(evalCase)}
                >
                  <div className="eval-case-header">
                    <div className="eval-case-select">
                      <input
                        type="checkbox"
                        checked={selectedCases.includes(evalCase.id)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleCaseSelect(evalCase.id)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="eval-case-info">
                      <div className="eval-case-name">{evalCase.name}</div>
                      <div className="eval-case-description">{evalCase.description}</div>
                    </div>
                    <div className={`eval-case-status ${getEvalStatusClass(evalStatus)}`}>
                      {getEvalStatusText(evalStatus)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {selectedEvalCase && (
        <div className="eval-case-details-panel">
          <h3>Evaluation Case Details</h3>
          <div className="eval-detail-row">
            <span className="detail-label">Case ID:</span>
            <span className="detail-value">{selectedEvalCase.id}</span>
          </div>
          <div className="eval-detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{selectedEvalCase.name}</span>
          </div>
          <div className="eval-detail-row">
            <span className="detail-label">Description:</span>
            <span className="detail-value">{selectedEvalCase.description}</span>
          </div>
          <div className="eval-detail-row">
            <span className="detail-label">Session ID:</span>
            <span className="detail-value">{selectedEvalCase.sessionId}</span>
          </div>
          
          <div className="eval-metrics-section">
            <h4>Evaluation Metrics</h4>
            <div className="eval-metrics-list">
              {evalMetrics.map(metric => (
                <div key={metric.name} className="eval-metric-item">
                  <div className="metric-name">{metric.name}</div>
                  <div className="metric-description">{metric.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {evaluationResults.size > 0 && selectedEvalSet && (
        <div className="eval-results-section">
          <h3>Evaluation Results</h3>
          <div className="eval-results-summary">
            <div className="summary-item">
              Total Cases: {evaluationResults.get(selectedEvalSet)?.length || 0}
            </div>
            <div className="summary-item pass">
              Passed: {evaluationResults.get(selectedEvalSet)?.filter(r => r.finalEvalStatus === 1).length || 0}
            </div>
            <div className="summary-item fail">
              Failed: {evaluationResults.get(selectedEvalSet)?.filter(r => r.finalEvalStatus === 2).length || 0}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}