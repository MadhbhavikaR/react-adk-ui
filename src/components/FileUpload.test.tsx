import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUpload from './FileUpload';

describe('FileUpload Component', () => {
  const mockFiles = [
    new File(['test content'], 'test.pdf', { type: 'application/pdf' }),
    new File(['image content'], 'photo.jpg', { type: 'image/jpeg' }),
  ];

  beforeEach(() => {
    // Mock file input
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('id', 'file-input');
    document.body.appendChild(fileInput);
  });

  afterEach(() => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      document.body.removeChild(fileInput);
    }
  });

  test('renders file upload component', () => {
    render(<FileUpload />);
    expect(screen.getByText('Drag & Drop Files Here')).toBeInTheDocument();
    expect(screen.getByText('or click to browse files')).toBeInTheDocument();
  });

  test('shows file information when files are selected', () => {
    render(<FileUpload />);
    const fileInput = screen.getByLabelText('file-input') as HTMLInputElement;
    
    // Simulate file selection
    Object.defineProperty(fileInput, 'files', {
      value: mockFiles,
    });
    fireEvent.change(fileInput);

    // Check if files are displayed
    expect(screen.getByText('Selected Files (2):')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
  });

  test('handles file removal', () => {
    render(<FileUpload />);
    const fileInput = screen.getByLabelText('file-input') as HTMLInputElement;
    
    // Add files
    Object.defineProperty(fileInput, 'files', {
      value: mockFiles,
    });
    fireEvent.change(fileInput);

    // Remove first file
    const removeButtons = screen.getAllByRole('button', { name: /Remove/ });
    fireEvent.click(removeButtons[0]);

    // Check if only one file remains
    expect(screen.getByText('Selected Files (1):')).toBeInTheDocument();
    expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
  });

  test('validates file count limit', () => {
    const mockError = jest.fn();
    render(<FileUpload maxFiles={1} onError={mockError} />);
    const fileInput = screen.getByLabelText('file-input') as HTMLInputElement;
    
    // Try to add more files than allowed
    const tooManyFiles = [
      new File(['file1'], 'file1.txt'),
      new File(['file2'], 'file2.txt'),
    ];
    
    Object.defineProperty(fileInput, 'files', {
      value: tooManyFiles,
    });
    fireEvent.change(fileInput);

    expect(mockError).toHaveBeenCalledWith('Maximum 1 files allowed');
  });

  test('validates file size limit', () => {
    const mockError = jest.fn();
    render(<FileUpload maxFileSize={100} onError={mockError} />);
    const fileInput = screen.getByLabelText('file-input') as HTMLInputElement;
    
    // Create a file larger than the limit
    const largeFile = new File(['a'.repeat(200)], 'large.txt');
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
    });
    fireEvent.change(fileInput);

    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('Files too large'));
  });

  test('handles upload button click', () => {
    const mockUploadComplete = jest.fn();
    render(<FileUpload onUploadComplete={mockUploadComplete} />);
    const fileInput = screen.getByLabelText('file-input') as HTMLInputElement;
    
    // Add files
    Object.defineProperty(fileInput, 'files', {
      value: mockFiles,
    });
    fireEvent.change(fileInput);

    // Click upload button
    const uploadButton = screen.getByRole('button', { name: /Upload/ });
    fireEvent.click(uploadButton);

    // Check if upload starts
    expect(screen.getByText('Uploading...')).toBeInTheDocument();
  });

  test('displays file size correctly', () => {
    render(<FileUpload />);
    const fileInput = screen.getByLabelText('file-input') as HTMLInputElement;
    
    // Add a file with specific size
    const testFile = new File(['test'], 'test.txt');
    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
    });
    fireEvent.change(fileInput);

    // Check if file size is displayed
    expect(screen.getByText(/Bytes/)).toBeInTheDocument();
  });

  test('shows drag and drop functionality', () => {
    render(<FileUpload />);
    const dropZone = screen.getByText('Drag & Drop Files Here').closest('div');
    
    // Simulate drag over
    if (dropZone) {
      fireEvent.dragOver(dropZone);
      fireEvent.dragEnter(dropZone);
      expect(dropZone).toHaveClass('drag-over');
      
      // Simulate drag leave
      fireEvent.dragLeave(dropZone);
      expect(dropZone).not.toHaveClass('drag-over');
    }
  });
});