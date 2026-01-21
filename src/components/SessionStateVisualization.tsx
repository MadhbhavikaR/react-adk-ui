import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, LinearProgress, Chip, Tooltip, IconButton, Dialog, DialogContent, DialogTitle, DialogActions, Button } from '@mui/material';
import { Info, Refresh, Visibility, Edit, Save, Cancel } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Styled components
const StateContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  position: 'relative',
}));

const StateHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StateSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const StateItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  }
}));

const StateValue = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  backgroundColor: theme.palette.action.hover,
  padding: theme.spacing(0.5, 1),
  borderRadius: 4,
  fontSize: '0.875rem',
}));

const StatusIndicator = styled(Box)<{ status: 'active' | 'idle' | 'error' | 'pending' }>(({ theme, status }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  marginRight: theme.spacing(1),
  backgroundColor: 
    status === 'active' ? theme.palette.success.main :
    status === 'idle' ? theme.palette.warning.main :
    status === 'error' ? theme.palette.error.main :
    theme.palette.info.main,
}));

const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(4),
  marginTop: theme.spacing(2),
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

export interface SessionState {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error' | 'pending';
  createdAt: string;
  updatedAt: string;
  variables: Record<string, any>;
  history: Array<{
    timestamp: string;
    action: string;
    details?: string;
    status?: string;
  }>;
  metadata?: Record<string, any>;
}

export interface SessionStateVisualizationProps {
  session: SessionState;
  onRefresh?: () => void;
  onEdit?: (updatedSession: SessionState) => void;
  editable?: boolean;
}

export const SessionStateVisualization: React.FC<SessionStateVisualizationProps> = ({
  session,
  onRefresh,
  onEdit,
  editable = false,
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSession, setEditedSession] = useState<SessionState>(session);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [expandedVariables, setExpandedVariables] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setEditedSession(session);
  }, [session]);

  const handleRefresh = () => {
    onRefresh?.();
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedSession(session);
    }
  };

  const handleSave = () => {
    onEdit?.(editedSession);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSession(session);
    setIsEditing(false);
  };

  const handleVariableChange = (key: string, value: any) => {
    setEditedSession(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [key]: value,
      }
    }));
  };

  const toggleVariableExpansion = (key: string) => {
    setExpandedVariables(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getStatusColor = () => {
    switch (session.status) {
      case 'active': return theme.palette.success.main;
      case 'idle': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      case 'pending': return theme.palette.info.main;
      default: return theme.palette.text.secondary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const formatVariableValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'string' && value.length > 50) {
      return expandedVariables[value] ? value : `${value.substring(0, 50)}...`;
    }
    return String(value);
  };

  const calculateDuration = () => {
    try {
      const created = new Date(session.createdAt);
      const updated = new Date(session.updatedAt);
      const durationMs = updated.getTime() - created.getTime();
      
      const seconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
      return `${seconds}s`;
    } catch {
      return 'Unknown';
    }
  };

  const displayedHistory = showFullHistory 
    ? session.history 
    : session.history.slice(-5);

  return (
    <StateContainer>
      <StateHeader>
        <Box display="flex" alignItems="center">
          <StatusIndicator status={session.status} />
          <Typography variant="h6">Session: {session.name}</Typography>
          <Chip 
            label={session.status.toUpperCase()}
            size="small"
            sx={{ 
              ml: 1,
              backgroundColor: getStatusColor() + '20',
              color: getStatusColor(),
            }}
          />
        </Box>
        <Box>
          {onRefresh && (
            <Tooltip title="Refresh session state">
              <IconButton size="small" onClick={handleRefresh} sx={{ mr: 1 }}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {editable && (
            <Tooltip title={isEditing ? 'Cancel editing' : 'Edit session'}>
              <IconButton 
                size="small" 
                onClick={handleEditToggle}
                color={isEditing ? 'error' : 'primary'}
              >
                {isEditing ? <Cancel fontSize="small" /> : <Edit fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </StateHeader>

      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Created: {formatTimestamp(session.createdAt)} • 
          Updated: {formatTimestamp(session.updatedAt)} • 
          Duration: {calculateDuration()}
        </Typography>
      </Box>

      <StateSection>
        <Typography variant="subtitle2" gutterBottom>
          Session Variables
        </Typography>
        
        {Object.entries(session.variables).length === 0 ? (
          <Typography variant="body2" color="text.disabled">
            No variables defined
          </Typography>
        ) : (
          Object.entries(session.variables).map(([key, value]) => (
            <StateItem key={key}>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" fontWeight="medium">
                  {key}:
                </Typography>
                {typeof value === 'string' && value.length > 50 && (
                  <Tooltip title={expandedVariables[key] ? 'Collapse' : 'Expand'}>
                    <IconButton 
                      size="small" 
                      onClick={() => toggleVariableExpansion(key)}
                      sx={{ ml: 0.5, p: 0.5 }}
                    >
                      <Info fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <StateValue>
                {formatVariableValue(value)}
              </StateValue>
            </StateItem>
          ))
        )}
      </StateSection>

      {session.metadata && Object.keys(session.metadata).length > 0 && (
        <StateSection>
          <Typography variant="subtitle2" gutterBottom>
            Metadata
          </Typography>
          
          {Object.entries(session.metadata).map(([key, value]) => (
            <StateItem key={key}>
              <Typography variant="body2" fontWeight="medium">
                {key}:
              </Typography>
              <StateValue>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </StateValue>
            </StateItem>
          ))}
        </StateSection>
      )}

      <StateSection>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2">
            Session History ({session.history.length})
          </Typography>
          {session.history.length > 5 && (
            <Button 
              size="small" 
              onClick={() => setShowFullHistory(!showFullHistory)}
            >
              {showFullHistory ? 'Show Less' : 'Show All'}
            </Button>
          )}
        </Box>

        <TimelineContainer>
          {displayedHistory.map((item, index) => (
            <TimelineItem key={index}>
              <Typography variant="caption" color="text.secondary">
                {formatTimestamp(item.timestamp)}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {item.action}
              </Typography>
              {item.details && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.details}
                </Typography>
              )}
              {item.status && (
                <Chip 
                  label={item.status}
                  size="small" 
                  sx={{ 
                    mt: 0.5,
                    backgroundColor: 
                      item.status === 'success' ? theme.palette.success.light + '80' :
                      item.status === 'error' ? theme.palette.error.light + '80' :
                      theme.palette.info.light + '80',
                  }}
                />
              )}
              {index < displayedHistory.length - 1 && <TimelineConnector />}
            </TimelineItem>
          ))}
        </TimelineContainer>
      </StateSection>

      {isEditing && (
        <Dialog open={isEditing} onClose={handleCancel} fullWidth maxWidth="md">
          <DialogTitle>Edit Session State</DialogTitle>
          <DialogContent dividers>
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Edit Variables
              </Typography>
              {Object.entries(editedSession.variables).map(([key, value]) => (
                <StateItem key={key}>
                  <Typography variant="body2" fontWeight="medium">
                    {key}:
                  </Typography>
                  <input
                    type="text"
                    value={typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    onChange={(e) => handleVariableChange(key, e.target.value)}
                    style={{ 
                      ...theme.typography.body2,
                      padding: '8px',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '4px',
                      flex: 1,
                      marginLeft: theme.spacing(1),
                    }}
                  />
                </StateItem>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleSave} color="primary" variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </StateContainer>
  );
};

export default SessionStateVisualization;