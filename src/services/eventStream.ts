import { API } from './api'

export const streamEvents = (payload: AgentRunRequest, callback: (event: any) => void) => {
  const eventSource = new EventSource(
    `${API.baseURL}/run_sse?${new URLSearchParams({
      appName: payload.appName,
      userId: payload.userId,
      sessionId: payload.sessionId || '',
    })}`
  )

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    callback(data)
  }

  eventSource.onerror = (error) => {
    console.error('EventSource failed:', error)
    eventSource.close()
  }

  return () => eventSource.close()
}