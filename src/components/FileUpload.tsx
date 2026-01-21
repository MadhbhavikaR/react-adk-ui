import React, { useState, useCallback } from 'react';
import { Button, Box, Typography, Paper, LinearProgress, IconButton } from '@mui/material';
import { CloudUpload, Delete, InsertDriveFile, Image, Description, AudioFile, VideoFile } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Styled components
const DropZone = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: theme.palette.background.default,
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.action.hover,
  },
  '&.drag-over': {
    borderColor: theme.palette.success.main,
    backgroundColor: theme.palette.success.light + '10',
  }
}));

const FileItem = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  }
}));

const FileIconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  backgroundColor: theme.palette.primary.light,
  borderRadius: theme.shape.borderRadius,
}));

// File type icons mapping
const fileTypeIcons: Record<string, React.ReactNode> = {
  'image': <Image fontSize="medium" />,
  'pdf': <Description fontSize="medium" />,
  'audio': <AudioFile fontSize="medium" />,
  'video': <VideoFile fontSize="medium" />,
  'default': <InsertDriveFile fontSize="medium" />,
};

// File type detection
const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
    return 'image';
  }
  if (extension === 'pdf') {
    return 'pdf';
  }
  if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) {
    return 'audio';
  }
  if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
    return 'video';
  }
  
  return 'default';
};

// File size formatting
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export interface FileUploadProps {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  onFilesSelected?: (files: File[]) => void;
  onUploadComplete?: (uploadedFiles: File[]) => void;
  onError?: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = ['*'],
  onFilesSelected,
  onUploadComplete,
  onError,
}) => {
  const theme = useTheme();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileSelect = useCallback((selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    
    // Validate file count
    if (files.length + fileArray.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    // Validate file types
    const invalidTypes = fileArray.filter(file => {
      if (acceptedFileTypes.includes('*')) return false;
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      return !acceptedFileTypes.some(type => 
        type.startsWith('.') ? file.name.endsWith(type) : fileExtension === type.toLowerCase()
      );
    });
    
    if (invalidTypes.length > 0) {
      onError?.(`Invalid file types: ${invalidTypes.map(f => f.name).join(', ')}`);
      return;
    }
    
    // Validate file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      onError?.(`Files too large (max ${formatFileSize(maxFileSize)}): ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    // Add files to state
    const newFiles = [...files, ...fileArray];
    setFiles(newFiles);
    onFilesSelected?.(fileArray);
  }, [files, maxFiles, maxFileSize, acceptedFileTypes, onFilesSelected, onError]);
  
  const handleRemoveFile = useCallback((index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  }, [files]);
  
  const handleUpload = useCallback(() => {
    if (files.length === 0) {
      onError?.('No files to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload process
    const simulateUpload = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadProgress(null);
          onUploadComplete?.(files);
          setFiles([]); // Clear files after upload
        }
      }, 300);
    };
    
    simulateUpload();
  }, [files, onUploadComplete, onError]);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);
  
  return (
    <Box>
      <DropZone
        className={isDragging ? 'drag-over' : ''}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedFileTypes.includes('*') ? undefined : acceptedFileTypes.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        <CloudUpload color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & Drop Files Here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to browse files
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Max files: {maxFiles}, Max size: {formatFileSize(maxFileSize)}
        </Typography>
        {acceptedFileTypes.length > 0 && acceptedFileTypes[0] !== '*' && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Allowed types: {acceptedFileTypes.join(', ')}
          </Typography>
        )}
      </DropZone>
      
      {files.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Files ({files.length}):
          </Typography>
          
          {files.map((file, index) => {
            const fileType = getFileType(file.name);
            const fileIcon = fileTypeIcons[fileType] || fileTypeIcons['default'];
            
            return (
              <FileItem key={`${file.name}-${file.size}-${index}`} elevation={1}>
                <FileIconWrapper>
                  {fileIcon}
                </FileIconWrapper>
                <Box flex={1}>
                  <Typography variant="body1" noWrap>
                    {file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveFile(index)}
                  color="error"
                  aria-label={`Remove ${file.name}`}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </FileItem>
            );
          })}
          
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              startIcon={<CloudUpload />}
            >
              {isUploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
            </Button>
          </Box>
          
          {isUploading && uploadProgress !== null && (
            <Box mt={2}>
              <Typography variant="body2" gutterBottom>
                Upload Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                color="primary"
              />
              <Typography variant="caption" align="right">
                {Math.round(uploadProgress)}%
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;