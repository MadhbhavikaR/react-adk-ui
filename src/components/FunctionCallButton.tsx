import { Button, Tooltip, Box, Typography, useTheme } from '@mui/material'
import { Functions, Code } from '@mui/icons-material'

interface FunctionCallButtonProps {
  functionName: string
  onClick: () => void
  disabled?: boolean
  showIcon?: boolean
  variant?: 'text' | 'outlined' | 'contained'
  size?: 'small' | 'medium' | 'large'
}

export const FunctionCallButton = ({ 
  functionName, 
  onClick, 
  disabled = false, 
  showIcon = true, 
  variant = 'outlined',
  size = 'small'
}: FunctionCallButtonProps) => {
  return (
    <Tooltip 
      title={`Call function: ${functionName}`}
      arrow
      placement="top"
    >
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        startIcon={showIcon ? <Functions fontSize={size} /> : undefined}
        sx={{ 
          textTransform: 'none',
          fontFamily: 'monospace',
          borderRadius: 2,
          ...(variant === 'outlined' && {
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'primary.light',
            }
          })
        }}
      >
        {functionName}
      </Button>
    </Tooltip>
  )
}

// Function call display for showing executed functions
export const FunctionCallDisplay = ({ 
  functionName, 
  parameters, 
  result
}: {
  functionName: string
  parameters?: Record<string, any>
  result?: any
}) => {
  const theme = useTheme()
  return (
    <Box sx={{ 
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      padding: 2,
      margin: 1,
      backgroundColor: theme.palette.background.paper
    }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Code color="primary" fontSize="small" />
        <Typography variant="subtitle2" fontFamily="monospace">
          {functionName}
        </Typography>
      </Box>
      
      {parameters && (
        <Box ml={2} mb={1}>
          <Typography variant="caption" color="text.secondary">
            Parameters:
          </Typography>
          <pre style={{ 
            fontSize: '0.8rem',
            margin: 0,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            {JSON.stringify(parameters, null, 2)}
          </pre>
        </Box>
      )}
      
      {result !== undefined && (
        <Box ml={2}>
          <Typography variant="caption" color="text.secondary">
            Result:
          </Typography>
          <pre style={{ 
            fontSize: '0.8rem',
            margin: 0,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            color: theme.palette.success.main
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Box>
      )}
    </Box>
  )
}