// Test setup file for React Testing Library
import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

// Configure React Testing Library
configure({ testIdAttribute: 'data-testid' })

// Mock matchMedia for theme toggle tests
global.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
})