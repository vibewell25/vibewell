'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, File as FileIcon, Image, Film, Music, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: Record<string, string[]>;
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  selectedFiles,
  maxFiles = 10,
  maxFileSize = 10, // 10MB default
  acceptedFileTypes,
  disabled = false
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
  };
  
  // Get file type icon based on file mime type
  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    
    switch (type) {
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'video':
        return <Film className="h-8 w-8 text-purple-500" />;
      case 'audio':
        return <Music className="h-8 w-8 text-green-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };
  
  // Check if file type is accepted
  const isFileTypeAccepted = (file: File): boolean => {
    if (!acceptedFileTypes) return true;
    
    return Object.entries(acceptedFileTypes).some(([mimeType, extensions]) => {
      // Check if file matches mime type pattern (e.g., 'image/*')
      if (mimeType.endsWith('/*') && file.type.startsWith(mimeType.replace('/*', '/'))) {
        return true;
      }
      
      // Check if file extension is in the accepted list
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return extensions.includes(fileExtension);
    });
  };
  
  // Validate files before adding
  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const errorMessages: string[] = [];
    
    // Check if adding these files would exceed the maxFiles limit
    if (selectedFiles.length + files.length > maxFiles) {
      errorMessages.push(`You can only upload a maximum of ${maxFiles} files.`);
      // Only take as many files as we can fit
      files = files.slice(0, maxFiles - selectedFiles.length);
    }
    
    for (const file of files) {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        errorMessages.push(`${file.name} exceeds the maximum file size of ${maxFileSize}MB.`);
        continue;
      }
      
      // Check file type
      if (!isFileTypeAccepted(file)) {
        errorMessages.push(`${file.name} has an unsupported file type.`);
        continue;
      }
      
      // Check if file with same name already exists
      if (selectedFiles.some(selectedFile => selectedFile.name === file.name)) {
        errorMessages.push(`${file.name} is already added.`);
        continue;
      }
      
      validFiles.push(file);
      
      // Initialize progress for valid files
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
      
      // Simulate upload progress
      simulateFileUploadProgress(file.name);
    }
    
    if (errorMessages.length > 0) {
      setErrors(errorMessages);
      // Clear errors after 5 seconds
      setTimeout(() => setErrors([]), 5000);
    }
    
    return validFiles;
  };
  
  // Simulate file upload progress
  const simulateFileUploadProgress = (fileName: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: Math.min(progress, 100)
      }));
    }, 200);
  };
  
  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(droppedFiles);
      
      if (validFiles.length > 0) {
        onFilesSelected([...selectedFiles, ...validFiles]);
      }
    }
  }, [disabled, maxFiles, maxFileSize, onFilesSelected, selectedFiles]);
  
  // Handle file selection from input
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files || e.target.files.length === 0) return;
    
    const selectedInputFiles = Array.from(e.target.files);
    const validFiles = validateFiles(selectedInputFiles);
    
    if (validFiles.length > 0) {
      onFilesSelected([...selectedFiles, ...validFiles]);
    }
    
    // Reset input value so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Remove a file from the selection
  const handleRemoveFile = (fileToRemove: File) => {
    const updatedFiles = selectedFiles.filter(file => file !== fileToRemove);
    onFilesSelected(updatedFiles);
    
    // Remove progress entry for the file
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileToRemove.name];
      return newProgress;
    });
  };
  
  // Generate accepted file types string for the input
  const getAcceptString = (): string => {
    if (!acceptedFileTypes) return '';
    
    return Object.entries(acceptedFileTypes)
      .flatMap(([mimeType, extensions]) => {
        // If it's a wildcard mime type like 'image/*', include it
        if (mimeType.endsWith('/*')) {
          return [mimeType];
        }
        // Otherwise, include all extensions
        return extensions;
      })
      .join(',');
  };
  
  return (
    <div className="space-y-4">
      {/* File drop area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-muted-foreground">
            {acceptedFileTypes
              ? `Accepted file types: ${Object.keys(acceptedFileTypes)
                  .map(type => type.replace('/*', ''))
                  .join(', ')}`
              : 'All file types accepted'}
          </p>
          <p className="text-xs text-muted-foreground">
            Maximum file size: {maxFileSize}MB ({selectedFiles.length}/{maxFiles} files)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={getAcceptString()}
          onChange={handleFileInputChange}
          disabled={disabled}
        />
      </div>
      
      {/* Error display */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 text-destructive rounded-md p-3">
          <p className="font-bold text-sm mb-1">Error:</p>
          <ul className="text-xs list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Files ({selectedFiles.length})</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-muted/40 rounded-md p-3"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 ? (
                    <div className="w-20">
                      <Progress value={uploadProgress[file.name]} className="h-2" />
                    </div>
                  ) : (
                    <span className="text-xs text-green-500">Ready</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file);
                    }}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Add more files button when some files are already selected */}
      {selectedFiles.length > 0 && selectedFiles.length < maxFiles && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="h-4 w-4 mr-2" />
          Add More Files
        </Button>
      )}
    </div>
  );
} 