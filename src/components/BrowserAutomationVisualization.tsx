import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, LinearProgress, Chip, Tooltip, IconButton, Dialog, DialogContent, DialogTitle, DialogActions, List, ListItem, ListItemText, ListItemIcon, Divider, Alert, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import { BrowserUpdated, Code, Computer, DesktopWindows, Extension, Fingerprint, Language, Memory, Mouse, ScreenSearchDesktop, Settings, Smartphone, Terminal, TouchApp, VpnKey, Web, WebAsset, Wifi, CheckCircle, ErrorOutline, InfoOutlined, Refresh, Add, Remove } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Styled components
const AutomationContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const BrowserPreview = styled('iframe')({
  width: '100%',
  height: 400,
  border: 'none',
  borderRadius: 4,
  backgroundColor: '#ffffff',
});

const AutomationStep = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  }
}));

const AutomationTimeline = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(4),
  margin: theme.spacing(2, 0),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: theme.spacing(2),
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: theme.palette.divider,
  }
}));

const TimelineItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingBottom: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -8,
    top: 12,
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    border: `3px solid ${theme.palette.background.paper}`,
  }
}));

const TimelineConnector = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: -2,
  top: 28,
  bottom: 0,
  width: 4,
  backgroundColor: theme.palette.divider,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  minWidth: 120,
}));

export interface AutomationStep {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed' | 'skipped';
  duration?: number;
  details?: Record<string, any>;
}

export interface BrowserAutomation {
  id: string;
  name: string;
  browser: string;
  url: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  steps: AutomationStep[];
  startTime: string;
  endTime?: string;
  metadata?: Record<string, any>;
}

export interface BrowserAutomationVisualizationProps {
  automation: BrowserAutomation;
  onAction?: (action: string, stepId?: string) => void;
  onRefresh?: () => void;
  showPreview?: boolean;
  interactive?: boolean;
}

export const BrowserAutomationVisualization: React.FC<BrowserAutomationVisualizationProps> = ({
  automation,
  onAction,
  onRefresh,
  showPreview = true,
  interactive = true,
}) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    // Find the first incomplete step
    const firstIncompleteIndex = automation.steps.findIndex(step => 
      step.status === 'pending' || step.status === 'failed'
    );
    setActiveStep(firstIncompleteIndex >= 0 ? firstIncompleteIndex : automation.steps.length - 1);
  }, [automation.steps]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle fontSize="inherit" color="success" />;
      case 'failed': return <ErrorOutline fontSize="inherit" color="error" />;
      case 'pending': return <CircularProgress size={16} color="inherit" />;
      case 'skipped': return <InfoOutlined fontSize="inherit" color="info" />;
      default: return <InfoOutlined fontSize="inherit" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'failed': return theme.palette.error.main;
      case 'pending': return theme.palette.warning.main;
      case 'skipped': return theme.palette.info.main;
      default: return theme.palette.text.secondary;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 1) return '< 1s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${Math.round(remainingSeconds)}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  const calculateProgress = () => {
    const totalSteps = automation.steps.length;
    if (totalSteps === 0) return 0;
    
    const completedSteps = automation.steps.filter(step => 
      step.status === 'completed' || step.status === 'skipped'
    ).length;
    
    return (completedSteps / totalSteps) * 100;
  };

  const handleStepAction = (action: string, stepId: string) => {
    onAction?.(action, stepId);
  };

  const toggleDetails = (stepId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const completedSteps = automation.steps.filter(step => 
    step.status === 'completed' || step.status === 'skipped'
  ).length;
  const totalSteps = automation.steps.length;

  return (
    <AutomationContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Browser Automation: {automation.name}</Typography>
        <Box>
          {onRefresh && (
            <Tooltip title="Refresh automation status">
              <IconButton size="small" onClick={onRefresh}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Browser: {automation.browser} • URL: <a href={automation.url} target="_blank" rel="noopener noreferrer">{new URL(automation.url).hostname}</a>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: 
          <Chip 
            label={automation.status.toUpperCase()}
            size="small"
            sx={{ 
              ml: 0.5,
              backgroundColor: getStatusColor(automation.status) + '20',
              color: getStatusColor(automation.status),
            }}
          />
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Progress: {completedSteps}/{totalSteps} steps ({Math.round(calculateProgress())}%)
        </Typography>
      </Box>

      <LinearProgress 
        variant="determinate"
        value={calculateProgress()}
        color={automation.status === 'failed' ? 'error' : 'primary'}
        sx={{ mb: 2, height: 6, borderRadius: 3 }}
      />

      {showPreview && (
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Browser Preview
          </Typography>
          <BrowserPreview 
            src={automation.url}
            title={`Automation Preview: ${automation.name}`}
          />
        </Box>
      )}

      <Typography variant="subtitle2" gutterBottom>
        Automation Steps
      </Typography>

      <AutomationTimeline>
        {automation.steps.map((step, index) => (
          <TimelineItem key={step.id}>
            <Typography variant="caption" color="text.secondary">
              Step {index + 1} • {formatTimestamp(step.timestamp)} • {formatDuration(step.duration)}
            </Typography>
            <Box display="flex" alignItems="center" mt={0.5}>
              {getStatusIcon(step.status)}
              <Typography variant="body2" fontWeight="medium" ml={1}>
                {step.action}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {step.description}
            </Typography>

            {step.details && (
              <Box mt={1}>
                <Button 
                  size="small"
                  onClick={() => toggleDetails(step.id)}
                  startIcon={showDetails[step.id] ? <Remove fontSize="small" /> : <Add fontSize="small" />}
                >
                  {showDetails[step.id] ? 'Hide' : 'Show'} Details
                </Button>
                
                {showDetails[step.id] && (
                  <Box mt={1} pl={2}>
                    {Object.entries(step.details).map(([key, value]) => (
                      <Typography key={key} variant="body2" component="div">
                        <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {interactive && automation.status === 'running' && step.status === 'pending' && (
              <Box mt={1} display="flex" gap={1}>
                <ActionButton 
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={() => handleStepAction('complete', step.id)}
                >
                  Mark Complete
                </ActionButton>
                <ActionButton 
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => handleStepAction('fail', step.id)}
                >
                  Mark Failed
                </ActionButton>
                <ActionButton 
                  variant="outlined"
                  size="small"
                  onClick={() => handleStepAction('skip', step.id)}
                >
                  Skip
                </ActionButton>
              </Box>
            )}

            {index < automation.steps.length - 1 && <TimelineConnector />}
          </TimelineItem>
        ))}
      </AutomationTimeline>

      {automation.metadata && Object.keys(automation.metadata).length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Automation Metadata
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {Object.entries(automation.metadata).map(([key, value]) => (
              <Box key={key} display="flex" justifyContent="space-between" py={0.5}>
                <Typography variant="body2" fontWeight="medium">
                  {key}:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      )}

      <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
        {automation.status === 'running' && (
          <>
            <Button 
              variant="outlined"
              color="error"
              onClick={() => onAction?.('pause')}
              disabled={!interactive}
            >
              Pause Automation
            </Button>
            <Button 
              variant="contained"
              color="success"
              onClick={() => onAction?.('complete')}
              disabled={!interactive}
            >
              Complete Automation
            </Button>
          </>
        )}
        {automation.status === 'paused' && (
          <Button 
            variant="contained"
            color="primary"
            onClick={() => onAction?.('resume')}
            disabled={!interactive}
          >
            Resume Automation
          </Button>
        )}
        {automation.status === 'failed' && (
          <Button 
            variant="contained"
            color="primary"
            onClick={() => onAction?.('retry')}
            disabled={!interactive}
          >
            Retry Automation
          </Button>
        )}
      </Box>
    </AutomationContainer>
  );
};

export default BrowserAutomationVisualization;