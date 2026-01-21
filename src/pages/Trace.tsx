import React, { useEffect } from 'react';
import { useTraceStore } from '../stores/traceStore';
import TraceTree from '../components/TraceTree';
import './Trace.css';

export default function Trace() {
  const { 
    traceData, 
    invocTraces, 
    invocToUserMsg, 
    fetchTraceData,
    rebuildTrace,
    clearTraceData 
  } = useTraceStore();

  // Sample trace data for demonstration
  useEffect(() => {
    // This would normally come from API or props
    const sampleTraceData = [
      {
        trace_id: 'trace-1',
        span_id: 'span-1',
        name: 'Invocation',
        start_time: Date.now() * 1_000_000,
        end_time: (Date.now() + 1000) * 1_000_000,
        attributes: {
          'gcp.vertex.agent.invocation_id': 'invoc-1',
          'gcp.vertex.agent.llm_request': JSON.stringify({
            contents: [{role: 'user', parts: [{text: 'Hello, how are you?'}]}]
          })
        }
      },
      {
        trace_id: 'trace-1',
        span_id: 'span-2',
        parent_span_id: 'span-1',
        name: 'call_llm',
        start_time: (Date.now() + 100) * 1_000_000,
        end_time: (Date.now() + 800) * 1_000_000,
        attributes: {
          'gcp.vertex.agent.invocation_id': 'invoc-1'
        }
      },
      {
        trace_id: 'trace-1',
        span_id: 'span-3',
        parent_span_id: 'span-1',
        name: 'tool',
        start_time: (Date.now() + 850) * 1_000_000,
        end_time: (Date.now() + 950) * 1_000_000,
        attributes: {
          'gcp.vertex.agent.invocation_id': 'invoc-1'
        }
      }
    ];

    fetchTraceData(sampleTraceData);
    
    return () => {
      clearTraceData();
    };
  }, []);

  return (
    <div className="trace-page">
      <h2>Trace Visualization</h2>
      
      {invocTraces.size === 0 ? (
        <div className="empty-state">No invocations found</div>
      ) : (
        <div className="trace-list-wrapper">
          <h3 className="trace-title">Invocations</h3>
          
          {Array.from(invocTraces.entries()).map(([traceId, spans], index) => (
            <div key={traceId} className="trace-item">
              <div className="trace-expansion-panel">
                <div className="trace-panel-header">
                  <div className="trace-panel-title">
                    {invocToUserMsg.get(traceId)}
                  </div>
                </div>
                <div className="trace-panel-content">
                  <TraceTree
                    spans={spans}
                    invocationId={useTraceStore.getState().findInvocIdFromTraceId(traceId) || ''}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}