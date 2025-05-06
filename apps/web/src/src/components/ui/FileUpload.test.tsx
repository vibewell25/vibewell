/* eslint-disable */import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './file-upload';

// Mock global URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Create a mock file
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File(['mock-file-content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('FileUpload Component', () => {
  // Setup mock functions
  const mockOnFilesSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} selectedFiles={[]} />);

    // Check for key elements
    expect(screen.getByText(/Drag and drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/Maximum file size: 10MB/i)).toBeInTheDocument();
    expect(screen.getByText(/All file types accepted/i)).toBeInTheDocument();
    expect(screen.getByText(/\(0\/10\) files/i)).toBeInTheDocument();
  });

  it('displays custom max file size, count and accepted file types', () => {
    const acceptedFileTypes = {
      'image/*': ['.jpg', '.jpeg', '.png'],
      'application/pdf': ['.pdf'],
    };

    render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        selectedFiles={[]}
        maxFiles={5}
        maxFileSize={20}
        acceptedFileTypes={acceptedFileTypes}
      />,

    expect(screen.getByText(/Maximum file size: 20MB/i)).toBeInTheDocument();
    expect(screen.getByText(/\(0\/5\) files/i)).toBeInTheDocument();
    expect(screen.getByText(/Accepted file types: image, application/i)).toBeInTheDocument();
  });

  it('handles file selection via input change', async () => {
    const user = userEvent.setup();

    render(<FileUpload onFilesSelected={mockOnFilesSelected} selectedFiles={[]} />);

    // Create mock file
    const mockFile = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');

    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate file selection
    await act(async () => {
      await user.upload(fileInput, mockFile);
    });

    // Check if onFilesSelected was called
    expect(mockOnFilesSelected).toHaveBeenCalledWith([mockFile]);
  });

  it('displays selected files', () => {
    const mockFile = createMockFile('test.pdf', 1024 * 1024, 'application/pdf');

    render(<FileUpload onFilesSelected={mockOnFilesSelected} selectedFiles={[mockFile]} />);

    expect(screen.getByText('Selected Files (1)')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('1 MB')).toBeInTheDocument();
  });

  it('handles file removal', async () => {
    const user = userEvent.setup();
    const mockFile = createMockFile('test.pdf', 1024 * 1024, 'application/pdf');

    render(<FileUpload onFilesSelected={mockOnFilesSelected} selectedFiles={[mockFile]} />);

    // Find and click the remove button
    const removeButton = screen.getByRole('button', { name: /Remove file/i });
    await user.click(removeButton);

    // Check if onFilesSelected was called with empty array
    expect(mockOnFilesSelected).toHaveBeenCalledWith([]);
  });

  it('validates file size', async () => {
    const user = userEvent.setup();

    render(<FileUpload onFilesSelected={mockOnFilesSelected} selectedFiles={[]} maxFileSize={1} />);

    // Create a file that exceeds the size limit (1MB)
    const tooLargeFile = createMockFile('large.jpg', 2 * 1024 * 1024, 'image/jpeg');

    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate file selection
    await act(async () => {
      await user.upload(fileInput, tooLargeFile);
    });

    // Check if error message is displayed
    expect(screen.getByText(/large.jpg exceeds the maximum file size of 1MB/i)).toBeInTheDocument();

    // Check that onFilesSelected wasn't called with invalid file
    expect(mockOnFilesSelected).not.toHaveBeenCalled();
  });

  it('validates file type', async () => {
    const user = userEvent.setup();
    const acceptedFileTypes = {
      'image/*': ['.jpg', '.jpeg', '.png'],
    };

    render(
            <FileUpload
              onFilesSelected={mockOnFilesSelected}
              selectedFiles={[]}
              acceptedFileTypes={acceptedFileTypes}
            />;

    // Create a file with unsupported type
    const unsupportedFile = createMockFile('document.pdf', 1024 * 1024, 'application/pdf');

    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate file selection
    await act(async () => {
      await user.upload(fileInput, unsupportedFile);
    });

    // Check if error message is displayed
    expect(screen.getByText(/document.pdf has an unsupported file type/i)).toBeInTheDocument();

    // Check that onFilesSelected wasn't called with invalid file
    expect(mockOnFilesSelected).not.toHaveBeenCalled();
  });

  it('prevents duplicate files', async () => {
    const user = userEvent.setup();
    const mockFile = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');

    render(<FileUpload onFilesSelected={mockOnFilesSelected} selectedFiles={[mockFile]} />);

    // Create a duplicate file (same name)
    const duplicateFile = createMockFile('test.jpg', 1024 * 1024, 'image/jpeg');

    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate file selection
    await act(async () => {
      await user.upload(fileInput, duplicateFile);
    });

    // Check if error message is displayed
    expect(screen.getByText(/test.jpg is already added/i)).toBeInTheDocument();

    // Check that onFilesSelected wasn't called again
    expect(mockOnFilesSelected).not.toHaveBeenCalled();
  });

  it('enforces max files limit', async () => {
    const user = userEvent.setup();

    // Create 10 mock files (hitting the default limit)
    const mockFiles = Array.from({ length: 10 }, (_, i) =>
      createMockFile(`file${i}.jpg`, 1024 * 1024, 'image/jpeg'),

    render(<FileUpload onFilesSelected={mockOnFilesSelected} selectedFiles={mockFiles} />);

    // Try to add one more file
    const oneMoreFile = createMockFile('onemore.jpg', 1024 * 1024, 'image/jpeg');

    // Get the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Simulate file selection
    await act(async () => {
      await user.upload(fileInput, oneMoreFile);
    });

    // Check if error message is displayed
    expect(screen.getByText(/You can only upload a maximum of 10 files/i)).toBeInTheDocument();

    // Check that onFilesSelected wasn't called with the additional file
    expect(mockOnFilesSelected).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} selectedFiles={[]} disabled={true} />);

    // Check that the dropzone has the disabled styles
    const dropzone = screen.getByText(/Drag and drop files here/i).closest('div');
    expect(dropzone).toHaveClass('opacity-50');
    expect(dropzone).toHaveClass('cursor-not-allowed');

    // Check that the file input is disabled
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeDisabled();
  }});
