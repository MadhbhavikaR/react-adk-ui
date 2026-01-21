import { IconButton, Tooltip, Box } from '@mui/material'
import { ThumbUp, ThumbDown } from '@mui/icons-material'

interface FeedbackButtonsProps {
  onPositiveFeedback: () => void
  onNegativeFeedback: () => void
  positiveCount?: number
  negativeCount?: number
  size?: 'small' | 'medium' | 'large'
}

export const FeedbackButtons = ({ 
  onPositiveFeedback, 
  onNegativeFeedback, 
  positiveCount = 0, 
  negativeCount = 0, 
  size = 'small'
}: FeedbackButtonsProps) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Tooltip title="Helpful">
        <IconButton 
          size={size}
          onClick={onPositiveFeedback}
          color="primary"
          aria-label="Positive feedback"
        >
          <ThumbUp fontSize={size} />
          {positiveCount > 0 && (
            <Box 
              component="span"
              sx={{ 
                ml: 0.5,
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              {positiveCount}
            </Box>
          )}
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Not helpful">
        <IconButton 
          size={size}
          onClick={onNegativeFeedback}
          color="error"
          aria-label="Negative feedback"
        >
          <ThumbDown fontSize={size} />
          {negativeCount > 0 && (
            <Box 
              component="span"
              sx={{ 
                ml: 0.5,
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              {negativeCount}
            </Box>
          )}
        </IconButton>
      </Tooltip>
    </Box>
  )
}

// Compact feedback buttons for inline use
export const CompactFeedbackButtons = ({ 
  onPositiveFeedback, 
  onNegativeFeedback, 
  positiveCount = 0, 
  negativeCount = 0
}: Omit<FeedbackButtonsProps, 'size'>) => {
  return (
    <FeedbackButtons 
      onPositiveFeedback={onPositiveFeedback}
      onNegativeFeedback={onNegativeFeedback}
      positiveCount={positiveCount}
      negativeCount={negativeCount}
      size="small"
    />
  )
}