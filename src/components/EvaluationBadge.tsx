import { Chip, Tooltip, Box } from '@mui/material'
import { CheckCircle, Error, Warning, Info, Help } from '@mui/icons-material'

type EvaluationStatus = 'pass' | 'fail' | 'warning' | 'info' | 'unknown'

interface EvaluationBadgeProps {
  status: EvaluationStatus
  score?: number
  threshold?: number
  size?: 'small' | 'medium'
  showScore?: boolean
}

export const EvaluationBadge = ({ 
  status, 
  score, 
  threshold, 
  size = 'small',
  showScore = true
}: EvaluationBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pass':
        return {
          color: 'success' as const,
          icon: <CheckCircle fontSize={size} />,
          label: 'Pass',
        }
      case 'fail':
        return {
          color: 'error' as const,
          icon: <Error fontSize={size} />,
          label: 'Fail',
        }
      case 'warning':
        return {
          color: 'warning' as const,
          icon: <Warning fontSize={size} />,
          label: 'Warning',
        }
      case 'info':
        return {
          color: 'info' as const,
          icon: <Info fontSize={size} />,
          label: 'Info',
        }
      case 'unknown':
      default:
        return {
          color: 'default' as const,
          icon: <Help fontSize={size} />,
          label: 'Unknown',
        }
    }
  }
  
  const { color, icon, label } = getStatusConfig()
  
  const badgeContent = (
    <Chip
      icon={icon}
      label={showScore && score !== undefined ? `${label} (${score}${threshold ? `/${threshold}` : ''})` : label}
      color={color}
      size={size}
      variant="filled"
    />
  )
  
  // Determine if we should show a tooltip with more details
  const shouldShowTooltip = score !== undefined || threshold !== undefined
  
  if (shouldShowTooltip) {
    const tooltipContent = (
      <Box>
        <Box fontWeight="bold">{label} Evaluation</Box>
        {score !== undefined && <Box>Score: {score}</Box>}
        {threshold !== undefined && <Box>Threshold: {threshold}</Box>}
        {score !== undefined && threshold !== undefined && (
          <Box>
            {score >= threshold ? '✓ Passed threshold' : '✗ Below threshold'}
          </Box>
        )}
      </Box>
    )
    
    return (
      <Tooltip title={tooltipContent} arrow>
        {badgeContent}
      </Tooltip>
    )
  }
  
  return badgeContent
}

// Compact evaluation badge for inline use
export const CompactEvaluationBadge = ({ 
  status, 
  score, 
  threshold
}: Omit<EvaluationBadgeProps, 'size' | 'showScore'>) => {
  return (
    <EvaluationBadge 
      status={status}
      score={score}
      threshold={threshold}
      size="small"
      showScore={false}
    />
  )
}

// Evaluation Comparison Component
import { Card, CardContent, Divider, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material'

// Styled evaluation comparison card
export const EvaluationComparisonCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
}))

// Styled comparison table
export const ComparisonTable = styled(TableContainer)(({ theme }) => ({
  margin: theme.spacing(2, 0),
}))

interface EvaluationComparisonProps {
  title: string
  evaluations: Array<{
    id: string
    name: string
    currentScore: number
    previousScore?: number
    maxScore: number
    status: 'passed' | 'failed' | 'pending' | 'skipped' | 'unknown'
    criteria: string
  }>
  showTrend?: boolean
}

export const EvaluationComparison = ({ 
  title, 
  evaluations, 
  showTrend = true
}: EvaluationComparisonProps) => {
  const theme = useTheme()

  const calculatePercentage = (score: number, maxScore: number) => {
    return Math.round((score / maxScore) * 100)
  }

  const getTrend = (current: number, previous?: number) => {
    if (!previous) return { icon: <TrendingFlat fontSize="small" />, color: 'default', label: 'No previous' }
    if (current > previous) return { icon: <TrendingUp fontSize="small" />, color: 'success', label: 'Improved' }
    if (current < previous) return { icon: <TrendingDown fontSize="small" />, color: 'error', label: 'Declined' }
    return { icon: <TrendingFlat fontSize="small" />, color: 'default', label: 'Same' }
  }

  return (
    <EvaluationComparisonCard>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        
        <ComparisonTable component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Evaluation</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Percentage</TableCell>
                {showTrend && <TableCell align="right">Trend</TableCell>}
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluations.map((evalItem) => (
                <TableRow key={evalItem.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{evalItem.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{evalItem.criteria}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{evalItem.currentScore}/{evalItem.maxScore}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress 
                        variant="determinate" 
                        value={calculatePercentage(evalItem.currentScore, evalItem.maxScore)} 
                        sx={{ 
                          width: 60, 
                          height: 6, 
                          borderRadius: 3, 
                          ...(evalItem.status === 'passed' && { backgroundColor: theme.palette.success.light }),
                          ...(evalItem.status === 'failed' && { backgroundColor: theme.palette.error.light }),
                        }}
                      />
                      <Typography variant="caption">
                        {calculatePercentage(evalItem.currentScore, evalItem.maxScore)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  {showTrend && (
                    <TableCell align="right">
                      {showTrend && (
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          {getTrend(evalItem.currentScore, evalItem.previousScore).icon}
                          <Typography variant="caption" color={getTrend(evalItem.currentScore, evalItem.previousScore).color}>
                            {evalItem.previousScore ? `${evalItem.currentScore - evalItem.previousScore}` : 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                  )}
                  <TableCell align="right">
                    <EvaluationBadge status={evalItem.status} score={evalItem.currentScore} maxScore={evalItem.maxScore} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ComparisonTable>
      </CardContent>
    </EvaluationComparisonCard>
  )
}