import { Suspense, lazy } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingSpinner } from './components/LoadingSpinner'

// Lazy load pages
const ChatPage = lazy(() => import('./pages/Chat'))
const TracePage = lazy(() => import('./pages/Trace'))
const SessionsPage = lazy(() => import('./pages/Sessions'))
const EvaluationsPage = lazy(() => import('./pages/Evaluations'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/chat',
    element: <ChatPage />,
  },
  {
    path: '/trace',
    element: <TracePage />,
  },
  {
    path: '/sessions',
    element: <SessionsPage />,
  },
  {
    path: '/evaluations',
    element: <EvaluationsPage />,
  },
])

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}