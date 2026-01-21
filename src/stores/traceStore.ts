import { create } from 'zustand';

interface Span {
  span_id: string;
  parent_span_id?: string;
  name: string;
  start_time: number;
  end_time: number;
  attributes?: Record<string, any>;
  children?: Span[];
}

interface TraceState {
  traceData: any[];
  invocTraces: Map<string, any[]>;
  invocToUserMsg: Map<string, string>;
  selectedTraceRow: Span | null;
  hoveredTraceRow: Span | null;
  isLoading: boolean;
  error: string | null;
  fetchTraceData: (data: any[]) => void;
  rebuildTrace: () => void;
  setSelectedTraceRow: (span: Span | null) => void;
  setHoveredTraceRow: (span: Span | null) => void;
  clearTraceData: () => void;
  findUserMsgFromInvocGroup: (group: any[]) => string;
  findInvocIdFromTraceId: (traceId: string) => string | undefined;
}

export const useTraceStore = create<TraceState>((set: (partial: Partial<TraceState>) => void, get: () => TraceState) => ({
  traceData: [],
  invocTraces: new Map<string, any[]>(),
  invocToUserMsg: new Map<string, string>(),
  selectedTraceRow: null,
  hoveredTraceRow: null,
  isLoading: false,
  error: null,

  fetchTraceData: (data: any[]) => {
    try {
      if (!Array.isArray(data)) {
        throw new Error('Invalid trace data format: expected array');
      }
      
      set({ traceData: data, isLoading: false, error: null });
      get().rebuildTrace();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to process trace data', 
        isLoading: false 
      });
    }
  },

  rebuildTrace: () => {
    const { traceData } = get();
    const invocTraces = new Map<string, any[]>();
    const invocToUserMsg = new Map<string, string>();

    // Group traces by trace_id
    traceData.forEach((item: any) => {
      const key = item.trace_id;
      const group = invocTraces.get(key);
      if (group) {
        group.push(item);
        group.sort((a: any, b: any) => a.start_time - b.start_time);
      } else {
        invocTraces.set(key, [item]);
      }
    });

    // Find user messages for each invocation
    invocTraces.forEach((value: any[], key: string) => {
      invocToUserMsg.set(key, get().findUserMsgFromInvocGroup(value));
    });

    set({ invocTraces, invocToUserMsg });
  },

  findUserMsgFromInvocGroup: (group: any[]): string => {
    // Find a span that has both invocation_id and llm_request
    const eventItem = group?.find(
      (item: any) => item.attributes !== undefined &&
          'gcp.vertex.agent.invocation_id' in item.attributes &&
          'gcp.vertex.agent.llm_request' in item.attributes
    );

    if (!eventItem) {
      return '[no invocation id found]';
    }

    try {
      const requestJson = JSON.parse(eventItem.attributes['gcp.vertex.agent.llm_request']);
      const userContent = requestJson.contents.filter((c: any) => c.role == 'user').at(-1);
      return userContent?.parts[0]?.text ?? '[attachment]';
    } catch {
      return '[error parsing request]';
    }
  },

  findInvocIdFromTraceId: (traceId: string): string | undefined => {
    const { invocTraces } = get();
    const group = invocTraces.get(traceId);
    return group
      ?.find((item: any) => item.attributes !== undefined &&
          'gcp.vertex.agent.invocation_id' in item.attributes)
      ?.attributes['gcp.vertex.agent.invocation_id'];
  },

  setSelectedTraceRow: (span: Span | null) => set({ selectedTraceRow: span }),
  setHoveredTraceRow: (span: Span | null) => set({ hoveredTraceRow: span }),

  clearTraceData: () => {
    set({
      traceData: [],
      invocTraces: new Map<string, any[]>(),
      invocToUserMsg: new Map<string, string>(),
      selectedTraceRow: null,
      hoveredTraceRow: null,
      error: null
    });
  }
}));