import React, { useState, useRef, useEffect } from 'react';
import { Button, Box, Typography, Paper, IconButton, LinearProgress, CircularProgress, Alert } from '@mui/material';
import { Mic, Stop, PlayArrow, Pause, Delete, Download, VolumeUp } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Styled components
const RecorderContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const AudioControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  margin: theme.spacing(2, 0),
  flexWrap: 'wrap',
}));

const AudioVisualizer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 60,
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(2, 0),
  overflow: 'hidden',
}));

const VisualizerBar = styled(Box)<{ active: boolean }>(({ theme, active }) => ({
  width: 4,
  height: '60%',
  backgroundColor: active ? theme.palette.primary.main : theme.palette.action.disabled,
  margin: '0 2px',
  transition: 'height 0.1s ease, background-color 0.1s ease',
  borderRadius: 2,
}));

const AudioPlayer = styled('audio')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
}));

export interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onError?: (error: string) => void;
  maxDuration?: number; // in seconds
  audioBitsPerSecond?: number;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onError,
  maxDuration = 300, // 5 minutes default
  audioBitsPerSecond = 128000,
}) => {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>(0);
  const recordingTimerRef = useRef<number>(0);
  const playbackTimerRef = useRef<number>(0);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  const initializeRecorder = async () => {
    try {
      // Check if microphone permission is granted
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access not supported in this browser');
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Create media recorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: audioBitsPerSecond,
      });

      // Set up audio visualization
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 64;
      source.connect(analyzer);

      setMediaRecorder(recorder);
      setAudioContext(audioCtx);
      setAnalyser(analyzer);
      setPermissionError(null);

    } catch (error) {
      console.error('Microphone access error:', error);
      setPermissionError(error instanceof Error ? error.message : 'Failed to access microphone');
      onError?.(error instanceof Error ? error.message : 'Failed to access microphone');
    }
  };

  const startRecording = async () => {
    if (!mediaRecorder) {
      await initializeRecorder();
      if (!mediaRecorder) return;
    }

    setIsRecording(true);
    setRecordingTime(0);
    setAudioChunks([]);

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

    // Start audio visualization
    if (analyser) {
      const visualize = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        setVisualizerData(Array.from(dataArray));
        animationRef.current = requestAnimationFrame(visualize);
      };
      visualize();
    }

    // Set up data collection
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setAudioChunks(prev => [...prev, event.data]);
      }
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
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Create audio blob and URL
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setAudioBlob(audioBlob);
      setAudioUrl(audioUrl);
      setDuration(recordingTime);
      
      // Call completion callback
      onRecordingComplete?.(audioBlob, recordingTime);
    };
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    } else {
      audioElement.play();
      setIsPlaying(true);
      
      // Start playback timer
      playbackTimerRef.current = window.setInterval(() => {
        setPlaybackTime(audioElement.currentTime);
      }, 100);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
    }
  };

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setPlaybackTime(0);
    setDuration(0);
    setIsPlaying(false);
  };

  const handleDownload = () => {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().getTime()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (maxDuration <= 0) return 0;
    return (recordingTime / maxDuration) * 100;
  };

  return (
    <RecorderContainer>
      <Typography variant="h6" gutterBottom align="center">
        Audio Recorder
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
            : audioUrl 
              ? `Duration: ${formatTime(duration)}`
              : 'Click the microphone button to start recording'}
        </Typography>
        {isRecording && (
          <LinearProgress 
            variant="determinate" 
            value={getProgress()} 
            color={getProgress() > 80 ? 'error' : 'primary'}
            sx={{ mt: 1, height: 4 }}
          />
        )}
      </Box>

      <AudioVisualizer>
        {visualizerData.length > 0 ? (
          visualizerData.slice(0, 30).map((value, index) => (
            <VisualizerBar 
              key={index}
              active={value > 50}
              sx={{ height: `${(value / 255) * 100}%` }}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.disabled">
            Audio visualization will appear here during recording
          </Typography>
        )}
      </AudioVisualizer>

      <AudioControls>
        {!isRecording && !audioUrl && (
          <Button
            variant="contained"
            color="primary"
            onClick={startRecording}
            startIcon={<Mic />}
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

        {audioUrl && (
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
      </AudioControls>

      {audioUrl && (
        <Box mt={2}>
          <Typography variant="body2" gutterBottom>
            Playback: {formatTime(playbackTime)} / {formatTime(duration)}
          </Typography>
          <AudioPlayer
            ref={audioRef}
            src={audioUrl}
            controls
            onEnded={handleAudioEnded}
          />
        </Box>
      )}
    </RecorderContainer>
  );
};

export default AudioRecorder;