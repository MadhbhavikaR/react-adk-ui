import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, LinearProgress, Chip, Tooltip, IconButton, Dialog, DialogContent, DialogTitle, DialogActions, TextField, List, ListItem, ListItemText, ListItemIcon, Divider, Alert } from '@mui/material';
import { Computer, DesktopWindows, Laptop, Smartphone, Tablet, Code, Terminal, BrowserUpdated, Settings, Warning, CheckCircle, Error, Info, Refresh, Close, ContentCopy, Download, Delete, Add, Remove } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Styled components
const IntegrationContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const DeviceGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: theme.spacing(2),
  margin: theme.spacing(2, 0),
}));

const DeviceCard = styled(Paper)<{ active?: boolean; status?: string }>(({ theme, active, status }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid ${active ? theme.palette.primary.main : 'transparent'}`,
  backgroundColor: 
    status === 'connected' ? theme.palette.success.light + '20' :
    status === 'error' ? theme.palette.error.light + '20' :
    status === 'pending' ? theme.palette.info.light + '20' :
    theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

const CommandInput = styled(TextField)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  }
}));

const CommandOutput = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  maxHeight: 300,
  overflowY: 'auto',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  whiteSpace: 'pre-wrap',
}));

const StatusIndicator = styled(Box)<{ status: string }>(({ theme, status }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: 
    status === 'connected' ? theme.palette.success.main :
    status === 'disconnected' ? theme.palette.error.main :
    status === 'pending' ? theme.palette.warning.main :
    theme.palette.text.secondary,
  marginRight: theme.spacing(1),
}));

const BrowserPreview = styled('iframe')({
  width: '100%',
  height: 400,
  border: 'none',
  borderRadius: 4,
  backgroundColor: '#ffffff',
});

export interface ComputerDevice {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'browser';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  os?: string;
  browser?: string;
  lastUsed?: string;
  capabilities: string[];
}

export interface ComputerCommand {
  id: string;
  command: string;
  timestamp: string;
  status: 'pending' | 'success' | 'error';
  output?: string;
  deviceId: string;
}

export interface ComputerUseIntegrationProps {
  devices: ComputerDevice[];
  commands?: ComputerCommand[];
  activeDeviceId?: string;
  onDeviceSelect?: (deviceId: string) => void;
  onCommandExecute?: (command: string, deviceId: string) => Promise<ComputerCommand>;
  onRefresh?: () => void;
  showBrowserPreview?: boolean;
  previewUrl?: string;
}

export const ComputerUseIntegration: React.FC<ComputerUseIntegrationProps> = ({
  devices = [],
  commands = [],
  activeDeviceId,
  onDeviceSelect,
  onCommandExecute,
  onRefresh,
  showBrowserPreview = false,
  previewUrl,
}) => {
  const theme = useTheme();
  const [selectedDeviceId, setSelectedDeviceId] = useState(activeDeviceId || devices[0]?.id);
  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [showCommandHistory, setShowCommandHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeDeviceId) {
      setSelectedDeviceId(activeDeviceId);
    }
  }, [activeDeviceId]);

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setError(null);
    onDeviceSelect?.(deviceId);
  };

  const handleCommandExecute = async () => {
    if (!commandInput.trim() || !selectedDeviceId || !onCommandExecute) return;

    setIsExecuting(true);
    setExecutionProgress(0);
    setError(null);

    try {
      // Simulate execution progress
      const progressInterval = setInterval(() => {
        setExecutionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await onCommandExecute(commandInput, selectedDeviceId);
      
      clearInterval(progressInterval);
      setExecutionProgress(100);
      
      // Reset after completion
      setTimeout(() => {
        setIsExecuting(false);
        setExecutionProgress(0);
        setCommandInput('');
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Command execution failed');
      setIsExecuting(false);
      setExecutionProgress(0);
    }
  };

  const handleRefresh = () => {
    setError(null);
    onRefresh?.();
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop': return <DesktopWindows fontSize="large" />;
      case 'laptop': return <Laptop fontSize="large" />;
      case 'tablet': return <Tablet fontSize="large" />;
      case 'mobile': return <Smartphone fontSize="large" />;
      case 'browser': return <BrowserUpdated fontSize="large" />;
      default: return <Computer fontSize="large" />;
    }
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return theme.palette.success.main;
      case 'disconnected': return theme.palette.error.main;
      case 'pending': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const selectedDevice = devices.find(device => device.id === selectedDeviceId);
  const deviceCommands = commands.filter(cmd => cmd.deviceId === selectedDeviceId);

  return (
    <IntegrationContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Computer Use Integration</Typography>
        <Box>
          {onRefresh && (
            <Tooltip title="Refresh devices">
              <IconButton size="small" onClick={handleRefresh} sx={{ mr: 1 }}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Command History">
            <IconButton size="small" onClick={() => setShowCommandHistory(!showCommandHistory)}>
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Typography variant="subtitle2" gutterBottom>
        Available Devices ({devices.length})
      </Typography>

      <DeviceGrid>
        {devices.map(device => (
          <DeviceCard
            key={device.id}
            active={device.id === selectedDeviceId}
            status={device.status}
            onClick={() => handleDeviceSelect(device.id)}
          >
            {getDeviceIcon(device.type)}
            <Typography variant="body2" mt={1} fontWeight="medium">
              {device.name}
            </Typography>
            <Typography variant="caption" display="block">
              {device.os || device.browser || device.type}
            </Typography>
            <Box display="flex" justifyContent="center" mt={0.5}>
              <StatusIndicator status={device.status} />
              <Typography variant="caption" color="text.secondary">
                {device.status}
              </Typography>
            </Box>
          </DeviceCard>
        ))}
      </DeviceGrid>

      {selectedDevice && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Device Details
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box display="flex" alignItems="center" mb={1}>
              {getDeviceIcon(selectedDevice.type)}
              <Typography variant="h6" ml={1}>
                {selectedDevice.name}
              </Typography>
            </Box>
            
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              {selectedDevice.capabilities.map(capability => (
                <Chip 
                  key={capability}
                  label={capability}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>

            <Typography variant="body2" color="text.secondary">
              Type: {selectedDevice.type} • 
              {selectedDevice.os && `OS: ${selectedDevice.os}`} • 
              {selectedDevice.browser && `Browser: ${selectedDevice.browser}`}
            </Typography>
            {selectedDevice.lastUsed && (
              <Typography variant="body2" color="text.secondary">
                Last Used: {new Date(selectedDevice.lastUsed).toLocaleString()}
              </Typography>
            )}
          </Paper>

          {showBrowserPreview && previewUrl && (
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Browser Preview
              </Typography>
              <BrowserPreview src={previewUrl} title="Browser Preview" />
            </Box>
          )}

          <Typography variant="subtitle2" gutterBottom mt={2}>
            Execute Command
          </Typography>
          
          <CommandInput
            fullWidth
            variant="outlined"
            placeholder={`Enter command for ${selectedDevice.name}`}
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            disabled={isExecuting || selectedDevice.status !== 'connected'}
            InputProps={{
              endAdornment: (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCommandExecute}
                  disabled={isExecuting || !commandInput.trim() || selectedDevice.status !== 'connected'}
                  sx={{ ml: 1 }}
                >
                  {isExecuting ? 'Executing...' : 'Execute'}
                </Button>
              )
            }}
          />

          {isExecuting && (
            <Box mt={2}>
              <Typography variant="body2" gutterBottom>
                Command Execution
              </Typography>
              <LinearProgress 
                variant="determinate"
                value={executionProgress}
                color={executionProgress < 100 ? 'primary' : 'success'}
              />
            </Box>
          )}

          {showCommandHistory && deviceCommands.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Command History ({deviceCommands.length})
              </Typography>
              <List dense>
                {deviceCommands.slice().reverse().map(command => (
                  <React.Fragment key={command.id}>
                    <ListItem>
                      <ListItemIcon>
                        {command.status === 'success' ? 
                          <CheckCircle color="success" fontSize="small" /> :
                        command.status === 'error' ? 
                          <Error color="error" fontSize="small" /> :
                          <Info color="info" fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={command.command}
                        secondary={`${new Date(command.timestamp).toLocaleTimeString()} • ${command.status}`}
                      />
                    </ListItem>
                    {command.output && (
                      <ListItem sx={{ pl: 4 }}>
                        <CommandOutput>
                          {command.output}
                        </CommandOutput>
                      </ListItem>
                    )}
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </Box>
      )}

      {!selectedDevice && (
        <Box display="flex" flexDirection="column" alignItems="center" py={4}>
          <Computer fontSize="large" color="disabled" />
          <Typography variant="body1" color="text.disabled" mt={2}>
            No devices available
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Connect a device or refresh to see available computers
          </Typography>
        </Box>
      )}
    </IntegrationContainer>
  );
};

export default ComputerUseIntegration;