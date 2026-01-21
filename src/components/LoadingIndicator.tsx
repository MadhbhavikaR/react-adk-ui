import { CircularProgress, Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

// Styled loading container
export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
}))

// Styled circular progress
export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
}))

interface LoadingIndicatorProps {
  size?: number
  message?: string
  fullScreen?: boolean
}

export const LoadingIndicator = ({ 
  size = 40, 
  message = 'Loading...',
  fullScreen = false
}: LoadingIndicatorProps) => {
  return (
    <LoadingContainer sx={fullScreen ? { 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 1300
    } : {}}>
      <StyledCircularProgress size={size} />
      {message && (
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      )}
    </LoadingContainer>
  )
}

// Small loading indicator for inline use
export const InlineLoading = ({ size = 20 }: { size?: number }) => (
  <Box display="inline-flex" alignItems="center" gap={1}>
    <StyledCircularProgress size={size} />
    <Typography variant="body2" color="text.secondary">
      Loading...
    </Typography>
  </Box>
)

// Button loading indicator
export const ButtonLoading = ({ size = 16 }: { size?: number }) => (
  <StyledCircularProgress size={size} />
)