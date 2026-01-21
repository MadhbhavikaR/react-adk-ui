import { GlobalStyles as MuiGlobalStyles } from '@mui/material'
import { theme } from '../theme'

export const GlobalStyles = () => (
  <MuiGlobalStyles 
    styles={(theme) => ({
      // Reset and base styles
      '*': {
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      },
      
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      
      body: {
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        lineHeight: theme.typography.body1.lineHeight,
      },
      
      // Scrollbar styling
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      
      '::-webkit-scrollbar-track': {
        background: theme.palette.background.paper,
      },
      
      '::-webkit-scrollbar-thumb': {
        background: theme.palette.grey[400],
        borderRadius: '4px',
      },
      
      '::-webkit-scrollbar-thumb:hover': {
        background: theme.palette.grey[500],
      },
      
      // Link styling
      a: {
        color: theme.palette.primary.main,
        textDecoration: 'none',
        transition: 'color 0.2s ease',
        
        '&:hover': {
          color: theme.palette.primary.dark,
          textDecoration: 'underline',
        },
      },
      
      // Button styling
      button: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: 'none',
        background: 'none',
        
        '&:disabled': {
          cursor: 'not-allowed',
          opacity: 0.6,
        },
      },
      
      // Form elements
      input: {
        width: '100%',
        padding: '0.75rem',
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: theme.shape.borderRadius,
        fontFamily: theme.typography.fontFamily,
        fontSize: '1rem',
        transition: 'border-color 0.2s ease',
        
        '&:focus': {
          outline: 'none',
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
        },
      },
      
      // Utility classes
      '.text-center': {
        textAlign: 'center',
      },
      
      '.text-left': {
        textAlign: 'left',
      },
      
      '.text-right': {
        textAlign: 'right',
      },
      
      '.mt-1': { marginTop: theme.spacing(1) },
      '.mt-2': { marginTop: theme.spacing(2) },
      '.mt-3': { marginTop: theme.spacing(3) },
      '.mt-4': { marginTop: theme.spacing(4) },
      '.mt-5': { marginTop: theme.spacing(5) },
      
      '.mb-1': { marginBottom: theme.spacing(1) },
      '.mb-2': { marginBottom: theme.spacing(2) },
      '.mb-3': { marginBottom: theme.spacing(3) },
      '.mb-4': { marginBottom: theme.spacing(4) },
      '.mb-5': { marginBottom: theme.spacing(5) },
      
      '.py-1': { paddingTop: theme.spacing(1), paddingBottom: theme.spacing(1) },
      '.py-2': { paddingTop: theme.spacing(2), paddingBottom: theme.spacing(2) },
      '.py-3': { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3) },
      
      // Animation
      '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      
      '.fade-in': {
        animation: 'fadeIn 0.3s ease-in',
      },
      
      // Layout
      '.container': {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
      },
      
      '.full-height': {
        minHeight: '100vh',
      },
      
      '.flex-center': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
    })}
  />
)