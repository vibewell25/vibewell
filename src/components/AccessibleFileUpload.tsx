import React, { useRef, useState } from 'react';

interface AccessibleFileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  buttonText?: string;
}

export const AccessibleFileUpload: React.FC<AccessibleFileUploadProps> = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize,
  className = '',
  label,
  required = false,
  disabled = false,
  error,
  helperText,
  buttonText = 'Choose File',
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (maxSize && file.size > maxSize) {
      // Handle file size error
      return;
    }

    setFileName(file.name);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div
        className={`relative rounded-lg border-2 border-dashed p-6 ${dragActive ? 'border-primary bg-primary bg-opacity-5' : 'border-gray-300'} ${error ? 'border-red-500' : ''} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={label || 'File upload area'}
        aria-disabled={disabled}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
        />
        <div className="text-center">
          <div className="flex flex-col items-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-2 text-sm text-gray-600">
              <span className="text-primary hover:text-primary-dark font-medium focus:underline focus:outline-none">
                {buttonText}
              </span>
              {' or drag and drop'}
            </div>
            {fileName && <p className="mt-1 text-xs text-gray-500">Selected file: {fileName}</p>}
            {maxSize && (
              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: {maxSize / 1024 / 1024}MB
              </p>
            )}
          </div>
        </div>
      </div>
      {error && (
        <p id="error-message" className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id="helper-text" className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default AccessibleFileUpload;
