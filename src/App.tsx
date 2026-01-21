import { Suspense, lazy, useEffect } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ThemeProvider } from '@mui/material/styles'
import { useThemeStore } from './stores/themeStore'
import { theme as lightTheme, darkTheme } from './theme'
import { GlobalStyles } from './styles/GlobalStyles'
import TestPage from './pages/TestPage'

// Lazy load pages
const ChatPage = lazy(() => import('./pages/Chat'))
const TracePage = lazy(() => import('./pages/Trace'))
const SessionsPage = lazy(() => import('./pages/Sessions'))
const EvaluationsPage = lazy(() => import('./pages/Evaluations'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <ChatPage />,
    errorElement: <ErrorBoundary><div>Error occurred</div></ErrorBoundary>,
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
  {
    path: '/test',
    element: <TestPage />,
  },
])

export default function App() {
  const { currentTheme } = useThemeStore()
  
  // Select the appropriate theme based on the current theme setting
  const selectedTheme = currentTheme === 'dark' ? darkTheme : lightTheme

  return (
    <ThemeProvider theme={selectedTheme}>
      <GlobalStyles />
      <Suspense fallback={<LoadingSpinner />}>
        <RouterProvider router={router} />
      </Suspense>
    </ThemeProvider>
  )
}