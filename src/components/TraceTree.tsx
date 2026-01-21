import { useEffect, useState } from 'react';
import { useTraceStore } from '../stores/traceStore';
import './TraceTree.css';

interface Span {
  span_id: string;
  parent_span_id?: string;
  name: string;
  start_time: number;
  end_time: number;
  attributes?: Record<string, any>;
  children?: Span[];
}

interface TraceTreeProps {
  spans: any[];
  invocationId: string;
}

const TraceTree = ({ spans, invocationId }: TraceTreeProps) => {
  const { 
    selectedTraceRow, 
    hoveredTraceRow, 
    setSelectedTraceRow, 
    setHoveredTraceRow 
  } = useTraceStore();
  
  const [tree, setTree] = useState<Span[]>([]);
  const [flatTree, setFlatTree] = useState<{span: Span; level: number}[]>([]);
  const [baseStartTimeMs, setBaseStartTimeMs] = useState<number>(0);
  const [totalDurationMs, setTotalDurationMs] = useState<number>(1);

  useEffect(() => {
    const builtTree = buildSpanTree(spans);
    const flattened = flattenTree(builtTree);
    const times = getGlobalTimes(spans);
    
    setTree(builtTree);
    setFlatTree(flattened);
    setBaseStartTimeMs(times.start);
    setTotalDurationMs(times.duration);
  }, [spans]);

  const buildSpanTree = (spans: any[]): Span[] => {
    const spanClones = spans.map(span => ({...span}));
    const spanMap = new Map<string, Span>();
    const roots: Span[] = [];

    spanClones.forEach(span => spanMap.set(span.span_id, span));
    spanClones.forEach(span => {
      if (span.parent_span_id && spanMap.has(span.parent_span_id)) {
        const parent = spanMap.get(span.parent_span_id)!;
        parent.children = parent.children || [];
        parent.children.push(span);
      } else {
        roots.push(span);
      }
    });

    return roots;
  };

  const getGlobalTimes = (spans: any[]) => {
    const start = Math.min(...spans.map(s => toMs(s.start_time)));
    const end = Math.max(...spans.map(s => toMs(s.end_time)));
    return {start, duration: end - start};
  };

  const toMs = (nanos: number): number => {
    return nanos / 1_000_000;
  };

  const getRelativeStart = (span: Span): number => {
    return ((toMs(span.start_time) - baseStartTimeMs) / totalDurationMs) * 100;
  };

  const getRelativeWidth = (span: Span): number => {
    return ((toMs(span.end_time) - toMs(span.start_time)) / totalDurationMs) * 100;
  };

  const flattenTree = (spans: Span[], level: number = 0): {span: Span; level: number}[] => {
    const tree = spans.flatMap(
      span => [
        {span, level},
        ...(span.children ? flattenTree(span.children, level + 1) : [])
      ]
    );
    return tree;
  };

  const getSpanIcon = (label: string): string => {
    const traceLabelIconMap = new Map<string, string>([
      ['Invocation', 'start'],
      ['agent_run', 'robot'],
      ['invoke_agent', 'robot_2'],
      ['tool', 'build'],
      ['execute_tool', 'build'],
      ['call_llm', 'chat'],
    ]);

    for (const [key, value] of traceLabelIconMap.entries()) {
      if (label.startsWith(key)) {
        return value;
      }
    }
    return 'start';
  };

  const selectRow = (node: {span: Span; level: number}) => {
    if (selectedTraceRow && selectedTraceRow.span_id == node.span.span_id) {
      setSelectedTraceRow(null);
      return;
    }
    setSelectedTraceRow(node.span);
  };

  const rowSelected = (node: {span: Span; level: number}) => {
    return selectedTraceRow === node.span;
  };

  const isEventRow = (node: {span: Span; level: number}) => {
    if (!node.span.attributes) {
      return false;
    }
    const eventId = node?.span.attributes['gcp.vertex.agent.event_id'];
    return !!eventId;
  };

  const onHover = (node: {span: Span; level: number}) => {
    setHoveredTraceRow(node.span);
  };

  const onHoverOut = () => {
    setHoveredTraceRow(null);
    if (selectedTraceRow) {
      setHoveredTraceRow(selectedTraceRow);
    }
  };

  const getArray = (n: number): number[] => {
    return Array.from({length: n});
  };

  return (
    <div className="trace-tree-container">
      <div className="invocation-id-container">
        Invocation ID: <span className="invocation-id">{invocationId}</span>
      </div>
      <div className="trace-container">
        {flatTree.map((node, index) => (
          <div
            key={index}
            className={`trace-row ${rowSelected(node) ? 'selected' : ''}`}
            onClick={() => selectRow(node)}
            onMouseEnter={() => onHover(node)}
            onMouseLeave={onHoverOut}
          >
            <div className="trace-row-left">
              <div className="trace-indent">
                {getArray(node.level).map((_, i) => (
                  <div key={i} className="indent-connector"></div>
                ))}
              </div>
              <span className={`material-symbols-outlined ${isEventRow(node) ? 'is-event-row' : ''}`}>
                {getSpanIcon(node.span.name)}
              </span>
              <div
                className="trace-label"
                style={{width: `${400 - node.level * 20}px`}}
              >
                {node.span.name}
              </div>
            </div>
            <div className="trace-bar-container">
              <div
                className="trace-bar"
                style={{left: `${getRelativeStart(node.span)}%`, width: `${getRelativeWidth(node.span)}%`}}
              >
                {(toMs(node.span.end_time) - toMs(node.span.start_time)).toFixed(2)}ms
              </div>
              {getRelativeWidth(node.span) < 10 && (
                <span
                  className="short-trace-bar-duration"
                  style={{left: `${getRelativeStart(node.span) + 5}%`}}
                >
                  {(toMs(node.span.end_time) - toMs(node.span.start_time)).toFixed(2)}ms
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TraceTree;