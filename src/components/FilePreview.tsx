import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, CircularProgress, Alert, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { Close, Download, Image, Description, AudioFile, VideoFile, InsertDriveFile, PictureAsPdf } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Styled components
const PreviewContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}));

const PreviewHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const PreviewContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  minHeight: 300,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const FileIconWrapper = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.primary.light,
  borderRadius: '50%',
}));

const ImagePreview = styled('img')({
  maxWidth: '100%',
  maxHeight: '60vh',
  objectFit: 'contain',
  borderRadius: 4,
});

const VideoPreview = styled('video')({
  maxWidth: '100%',
  maxHeight: '60vh',
  borderRadius: 4,
});

const AudioPreview = styled('audio')({
  width: '100%',
  marginTop: theme.spacing(2),
});

const PdfPreview = styled('iframe')({
  width: '100%',
  height: '60vh',
  border: 'none',
  borderRadius: 4,
});

export interface FilePreviewProps {
  file: File;
  onClose: () => void;
  onDownload?: () => void;
  previewMode?: 'inline' | 'dialog';
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onClose,
  onDownload,
  previewMode = 'dialog',
}) => {
  const theme = useTheme();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(previewMode === 'dialog');

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Generate preview URL for the file
  useEffect(() => {
    const generatePreview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create object URL for the file
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        
      } catch (err) {
        setError('Failed to generate preview');
        console.error('Preview generation error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    generatePreview();
  }, [file]);

  const handleDownload = () => {
    if (previewUrl) {
      const a = document.createElement('a');
      a.href = previewUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onDownload?.();
    }
  };

  const getFileIcon = () => {
    const fileType = file.type || '';
    
    if (fileType.startsWith('image/')) {
      return <Image fontSize="large" color="primary" />;
    }
    if (fileType === 'application/pdf') {
      return <PictureAsPdf fontSize="large" color="error" />;
    }
    if (fileType.startsWith('audio/')) {
      return <AudioFile fontSize="large" color="secondary" />;
    }
    if (fileType.startsWith('video/')) {
      return <VideoFile fontSize="large" color="success" />;
    }
    
    return <InsertDriveFile fontSize="large" color="action" />;
  };

  const renderPreviewContent = () => {
    if (loading) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center">
          <CircularProgress size={48} />
          <Typography variant="body2" mt={2}>
            Loading preview...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      );
    }

    if (!previewUrl) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center">
          <FileIconWrapper>
            {getFileIcon()}
          </FileIconWrapper>
          <Typography variant="h6" gutterBottom>
            {file.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preview not available for this file type
          </Typography>
        </Box>
      );
    }

    const fileType = file.type || '';

    if (fileType.startsWith('image/')) {
      return <ImagePreview src={previewUrl} alt={file.name} />;
    }

    if (fileType === 'application/pdf') {
      return (
        <PdfPreview 
          src={previewUrl} 
          title={file.name}
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }

    if (fileType.startsWith('audio/')) {
      return (
        <Box width="100%">
          <Typography variant="subtitle1" gutterBottom>
            Audio Preview: {file.name}
          </Typography>
          <AudioPreview controls src={previewUrl} />
        </Box>
      );
    }

    if (fileType.startsWith('video/')) {
      return (
        <VideoPreview controls src={previewUrl} />
      );
    }

    // Fallback for other file types
    return (
      <Box display="flex" flexDirection="column" alignItems="center">
        <FileIconWrapper>
          {getFileIcon()}
        </FileIconWrapper>
        <Typography variant="h6" gutterBottom>
          {file.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          File type: {fileType || 'Unknown'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Size: {(file.size / 1024).toFixed(2)} KB
        </Typography>
      </Box>
    );
  };

  const previewContent = (
    <PreviewContainer>
      <PreviewHeader>
        <Typography variant="subtitle1" noWrap>
          {file.name}
        </Typography>
        <Box>
          {onDownload && (
            <IconButton 
              size="small" 
              onClick={handleDownload}
              title="Download file"
              sx={{ mr: 1 }}
            >
              <Download fontSize="small" />
            </IconButton>
          )}
          <IconButton 
            size="small" 
            onClick={() => previewMode === 'dialog' ? setIsDialogOpen(false) : onClose()}
            title="Close preview"
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </PreviewHeader>
      <PreviewContent>
        {renderPreviewContent()}
      </PreviewContent>
    </PreviewContainer>
  );

  if (previewMode === 'dialog') {
    return (
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogContent dividers>
          {previewContent}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDialogOpen(false)} 
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return previewContent;
};

export default FilePreview;