import React, { useState, useRef, useEffect } from 'react';
import { Button, Box, Typography, Paper, IconButton, CircularProgress, Alert, Dialog, DialogContent, DialogActions } from '@mui/material';
import { Videocam, Stop, PlayArrow, Pause, Delete, Download, Camera, VideoCameraFront, FlipCameraAndroid } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Styled components
const RecorderContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const VideoControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  margin: theme.spacing(2, 0),
  flexWrap: 'wrap',
}));

const VideoPreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio: '16/9',
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  margin: theme.spacing(2, 0),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const VideoElement = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  backgroundColor: '#000',
});

const CameraToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  }
}));

const RecordingIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  backgroundColor: 'rgba(220, 0, 0, 0.8)',
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  zIndex: 1,
}));

export interface VideoRecorderProps {
  onRecordingComplete?: (videoBlob: Blob, duration: number) => void;
  onError?: (error: string) => void;
  maxDuration?: number; // in seconds
  videoBitsPerSecond?: number;
  facingMode?: 'user' | 'environment';
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onRecordingComplete,
  onError,
  maxDuration = 300, // 5 minutes default
  videoBitsPerSecond = 2500000, // 2.5 Mbps
  facingMode = 'user',
}) => {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<typeof facingMode>(facingMode);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const recordingTimerRef = useRef<number>(0);
  const playbackTimerRef = useRef<number>(0);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      // Check if camera access is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      mediaStreamRef.current = stream;

      // Create media recorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
        videoBitsPerSecond: videoBitsPerSecond,
      });

      setMediaRecorder(recorder);
      setPermissionError(null);
      setIsCameraReady(true);

      // Set video preview
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
        previewVideoRef.current.play();
      }

    } catch (error) {
      console.error('Camera access error:', error);
      setPermissionError(error instanceof Error ? error.message : 'Failed to access camera');
      onError?.(error instanceof Error ? error.message : 'Failed to access camera');
    }
  };

  const startRecording = async () => {
    if (!mediaRecorder) {
      await initializeCamera();
      if (!mediaRecorder) return;
    }

    setIsRecording(true);
    setRecordingTime(0);

    mediaRecorder.start();

    // Start recording timer
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= maxDuration) {
          stopRecording();
          return maxDuration;
        }
        return prev + 1;
      });
    }, 1000);

    // Set up data collection
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(videoBlob);
      
      setVideoBlob(videoBlob);
      setVideoUrl(videoUrl);
      setDuration(recordingTime);
      
      // Call completion callback
      onRecordingComplete?.(videoBlob, recordingTime);
    };
  };

  const stopRecording = () => {
    if (!mediaRecorder || !isRecording) return;

    // Stop recording
    mediaRecorder.stop();
    setIsRecording(false);

    // Clear timers
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    // Stop media stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (!videoUrl) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
      setIsPlaying(false);
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    } else {
      videoElement.play();
      setIsPlaying(true);
      
      // Start playback timer
      playbackTimerRef.current = window.setInterval(() => {
        setPlaybackTime(videoElement.currentTime);
      }, 100);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
    }
  };

  const clearRecording = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setVideoBlob(null);
    setRecordingTime(0);
    setPlaybackTime(0);
    setDuration(0);
    setIsPlaying(false);
    
    // Reinitialize camera for preview
    if (!isRecording) {
      initializeCamera();
    }
  };

  const handleDownload = () => {
    if (!videoBlob) return;

    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().getTime()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const toggleCamera = () => {
    const newFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(newFacingMode);
    
    // Restart camera with new facing mode
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (!isRecording) {
      initializeCamera();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <RecorderContainer>
      <Typography variant="h6" gutterBottom align="center">
        Video Recorder
      </Typography>

      {permissionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {permissionError}
        </Alert>
      )}

      <Box mb={2} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          {isRecording 
            ? `Recording: ${formatTime(recordingTime)} / ${formatTime(maxDuration)}`
            : videoUrl 
              ? `Duration: ${formatTime(duration)}`
              : 'Click the camera button to start recording'}
        </Typography>
      </Box>

      <VideoPreviewContainer>
        {isRecording || !videoUrl ? (
          <>
            {isCameraReady ? (
              <VideoElement 
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
              />
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center">
                <Camera fontSize="large" color="disabled" />
                <Typography variant="body2" color="text.disabled" mt={2}>
                  Camera preview will appear here
                </Typography>
              </Box>
            )}
            
            {isRecording && (
              <RecordingIndicator>
                <CircularProgress size={16} color="inherit" />
                <Typography variant="caption">REC</Typography>
              </RecordingIndicator>
            )}
            
            {!isRecording && isCameraReady && (
              <CameraToggleButton 
                onClick={toggleCamera}
                title={`Switch to ${cameraFacingMode === 'user' ? 'rear' : 'front'} camera`}
                size="small"
              >
                <FlipCameraAndroid fontSize="small" />
              </CameraToggleButton>
            )}
          </>
        ) : (
          <VideoElement 
            ref={videoRef}
            src={videoUrl}
            controls
            onEnded={handleVideoEnded}
          />
        )}
      </VideoPreviewContainer>

      <VideoControls>
        {!isRecording && !videoUrl && (
          <Button
            variant="contained"
            color="primary"
            onClick={startRecording}
            startIcon={<Videocam />}
            disabled={!!permissionError}
          >
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button
            variant="contained"
            color="error"
            onClick={stopRecording}
            startIcon={<Stop />}
          >
            Stop Recording
          </Button>
        )}

        {videoUrl && (
          <>
            <Button
              variant="outlined"
              onClick={togglePlayback}
              startIcon={isPlaying ? <Pause /> : <PlayArrow />}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleDownload}
              startIcon={<Download />}
            >
              Download
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={clearRecording}
              startIcon={<Delete />}
            >
              Clear
            </Button>
          </>
        )}
      </VideoControls>

      {videoUrl && (
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Playback: {formatTime(playbackTime)} / {formatTime(duration)}
          </Typography>
        </Box>
      )}
    </RecorderContainer>
  );
};

export default VideoRecorder;