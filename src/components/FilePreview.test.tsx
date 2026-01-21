import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilePreview from './FilePreview';

describe('FilePreview Component', () => {
  const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  const mockImageFile = new File(['image content'], 'photo.jpg', { type: 'image/jpeg' });
  const mockPdfFile = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' });

  test('renders file preview component', () => {
    render(<FilePreview file={mockFile} onClose={() => {}} />);
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<FilePreview file={mockFile} onClose={() => {}} />);
    expect(screen.getByText('Loading preview...')).toBeInTheDocument();
  });

  test('displays file information for non-previewable files', async () => {
    render(<FilePreview file={mockFile} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Preview not available for this file type')).toBeInTheDocument();
    });
  });

  test('handles close button click', () => {
    const mockOnClose = jest.fn();
    render(<FilePreview file={mockFile} onClose={mockOnClose} />);
    
    const closeButton = screen.getByTitle('Close preview');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles download button click', async () => {
    const mockOnDownload = jest.fn();
    render(<FilePreview file={mockFile} onClose={() => {}} onDownload={mockOnDownload} />);
    
    await waitFor(() => {
      const downloadButton = screen.getByTitle('Download file');
      if (downloadButton) {
        fireEvent.click(downloadButton);
        expect(mockOnDownload).toHaveBeenCalled();
      }
    });
  });

  test('displays file size information', async () => {
    render(<FilePreview file={mockFile} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText(/KB/)).toBeInTheDocument();
    });
  });

  test('renders dialog mode correctly', () => {
    render(<FilePreview file={mockFile} onClose={() => {}} previewMode="dialog" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('renders inline mode correctly', () => {
    render(<FilePreview file={mockFile} onClose={() => {}} previewMode="inline" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('shows appropriate icons for different file types', async () => {
    // Test text file
    render(<FilePreview file={mockFile} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText('text/plain')).toBeInTheDocument();
    });

    // Test image file
    render(<FilePreview file={mockImageFile} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByAltText('photo.jpg')).toBeInTheDocument();
    });

    // Test PDF file
    render(<FilePreview file={mockPdfFile} onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByTitle('document.pdf')).toBeInTheDocument();
    });
  });

  test('handles error state gracefully', async () => {
    // Mock URL.createObjectURL to throw error
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = jest.fn(() => { throw new Error('Test error') });
    
    render(<FilePreview file={mockFile} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to generate preview')).toBeInTheDocument();
    });
    
    // Restore original function
    URL.createObjectURL = originalCreateObjectURL;
  });
});