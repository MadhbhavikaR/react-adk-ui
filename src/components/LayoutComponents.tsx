import { Card, CardContent, CardHeader, Container, Paper, Box } from '@mui/material'
import { styled } from '@mui/material/styles'

// Styled Container with consistent padding
export const AppContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: '1200px !important',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}))

// Main content container
export const MainContent = styled('main')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 'calc(100vh - 64px)', // Account for header
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
}))

// Styled Card component
export const AppCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}))

// Card with header
export const AppCardWithHeader = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <AppCard>
    <CardHeader 
      title={title}
      titleTypographyProps={{ variant: 'h6', fontWeight: 500 }}
      sx={{ padding: '16px 24px' }}
    />
    <CardContent sx={{ padding: '24px' }}>
      {children}
    </CardContent>
  </AppCard>
)

// Simple card without header
export const SimpleCard = ({ children }: { children: React.ReactNode }) => (
  <AppCard>
    <CardContent sx={{ padding: '24px' }}>
      {children}
    </CardContent>
  </AppCard>
)

// Section container
export const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '&:last-child': {
    marginBottom: 0,
  },
}))

// Page header
export const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

// Page title
export const PageTitle = styled('h1')(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  margin: 0,
}))

// Page subtitle
export const PageSubtitle = styled('h2')(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
  margin: `${theme.spacing(1)} 0 ${theme.spacing(2)} 0`,
}))

// Layout wrapper for consistent spacing
export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'background.default'
  }}>
    {children}
  </Box>
)

// Content wrapper with max width
export const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ 
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: { xs: '0 1rem', sm: '0 2rem' }
  }}>
    {children}
  </Box>
)