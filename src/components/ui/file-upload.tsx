'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, File as FileIcon, Image, Film, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

// Main interface for file upload
interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: Record<string, string[]>;
  disabled?: boolean;
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math?.floor(Math?.log(bytes) / Math?.log(1024));

  return `${parseFloat((bytes / Math?.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

const getFileIcon = (file: File) => {
  const type = file?.type.split('/')[0];

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

const getAcceptString = (acceptedFileTypes?: Record<string, string[]>): string => {
  if (!acceptedFileTypes) return '';

  return Object?.entries(acceptedFileTypes)
    .flatMap(([mimeType, extensions]) => {
      // If it's a wildcard mime type like 'image/*', include it
      if (mimeType?.endsWith('/*')) {
        return [mimeType];
      }
      // Otherwise, include all extensions
      return extensions;
    })
    .join(',');
};

// File Drop Zone Component
interface FileDropZoneProps {
  onFilesDrop: (files: File[]) => void;
  acceptedFileTypes?: Record<string, string[]>;
  maxFiles: number;
  currentFileCount: number;
  maxFileSize: number;
  disabled: boolean;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  fileInputRef: React?.RefObject<HTMLInputElement>;
}

const FileDropZone: React?.FC<FileDropZoneProps> = ({
  onFilesDrop,
  acceptedFileTypes,
  maxFiles,
  currentFileCount,
  maxFileSize,
  disabled,
  isDragging,
  setIsDragging,
  fileInputRef,
}) => {
  const handleDragOver = (e: React?.DragEvent<HTMLDivElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React?.DragEvent<HTMLDivElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React?.DragEvent<HTMLDivElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e?.dataTransfer.files && e?.dataTransfer.files?.length > 0) {
      const droppedFiles = Array?.from(e?.dataTransfer.files);
      onFilesDrop(droppedFiles);
    }
  };

  return (
    <div
      className={cn(
        'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'hover:border-primary/50 border-border',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef?.current?.click()}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">Drag and drop files here, or click to select files</p>
        <p className="text-xs text-muted-foreground">
          {acceptedFileTypes
            ? `Accepted file types: ${Object?.keys(acceptedFileTypes)
                .map((type) => type?.replace('/*', ''))
                .join(', ')}`
            : 'All file types accepted'}
        </p>
        <p className="text-xs text-muted-foreground">
          Maximum file size: {maxFileSize}MB ({currentFileCount}/{maxFiles} files)
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept={getAcceptString(acceptedFileTypes)}
        onChange={(e) => {
          if (e?.target.files?.length) {
            onFilesDrop(Array?.from(e?.target.files));

            // Reset input value so the same file can be selected again if removed
            if (fileInputRef?.current) {
              fileInputRef?.current.value = '';
            }
          }
        }}
        disabled={disabled}
      />
    </div>
  );
};

// File Error Messages Component
interface FileErrorsProps {
  errors: string[];
}

const FileErrors: React?.FC<FileErrorsProps> = ({ errors }) => {
  if (errors?.length === 0) return null;

  return (
    <div className="rounded-md bg-destructive/10 p-3 text-destructive">
      <p className="mb-1 text-sm font-bold">Error:</p>
      <ul className="list-inside list-disc text-xs">
        {errors?.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};

// File Item Component
interface FileItemProps {
  file: File;
  progress: number;
  onRemove: (file: File) => void;
}

const FileItem: React?.FC<FileItemProps> = ({ file, progress, onRemove }) => {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
      <div className="flex items-center space-x-3">
        {getFileIcon(file)}
        <div className="space-y-1">
          <p className="max-w-[200px] truncate text-sm font-medium">{file?.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file?.size)}</p>
          <Progress value={progress} className="h-1 w-32" />
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={(e) => {
          e?.stopPropagation();
          onRemove(file);
        }}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove file</span>
      </Button>
    </div>
  );
};

// File List Component
interface FileListProps {
  files: File[];
  progress: Record<string, number>;
  onRemove: (file: File) => void;
}

const FileList: React?.FC<FileListProps> = ({ files, progress, onRemove }) => {
  if (files?.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Selected Files ({files?.length})</p>
      <div className="max-h-60 space-y-2 overflow-y-auto">
        {files?.map((file, index) => (
          <FileItem
            key={`${file?.name}-${index}`}
            file={file}
            progress={progress[file?.name] || 0}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};

// Main Component
export function FileUpload({
  onFilesSelected,
  selectedFiles,
  maxFiles = 10,
  maxFileSize = 10, // 10MB default
  acceptedFileTypes,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if file type is accepted
  const isFileTypeAccepted = (file: File): boolean => {
    if (!acceptedFileTypes) return true;

    return Object?.entries(acceptedFileTypes).some(([mimeType, extensions]) => {
      // Check if file matches mime type pattern (e?.g., 'image/*')
      if (mimeType?.endsWith('/*') && file?.type.startsWith(mimeType?.replace('/*', '/'))) {
        return true;
      }

      // Check if file extension is in the accepted list
      const fileExtension = '.' + file?.name.split('.').pop()?.toLowerCase();
      return extensions?.includes(fileExtension);
    });
  };

  // Validate files before adding
  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const errorMessages: string[] = [];

    // Check if adding these files would exceed the maxFiles limit
    if (selectedFiles?.length + files?.length > maxFiles) {
      errorMessages?.push(`You can only upload a maximum of ${maxFiles} files.`);
      // Only take as many files as we can fit
      files = files?.slice(0, maxFiles - selectedFiles?.length);
    }

    for (const file of files) {
      // Check file size
      if (file?.size > maxFileSize * 1024 * 1024) {
        errorMessages?.push(`${file?.name} exceeds the maximum file size of ${maxFileSize}MB.`);
        continue;
      }

      // Check file type
      if (!isFileTypeAccepted(file)) {
        errorMessages?.push(`${file?.name} has an unsupported file type.`);
        continue;
      }

      // Check if file with same name already exists
      if (selectedFiles?.some((selectedFile) => selectedFile?.name === file?.name)) {
        errorMessages?.push(`${file?.name} is already added.`);
        continue;
      }

      validFiles?.push(file);

      // Initialize progress for valid files
      setUploadProgress((prev) => ({
        ...prev,
        [file?.name]: 0,
      }));

      // Simulate upload progress
      simulateFileUploadProgress(file?.name);
    }

    if (errorMessages?.length > 0) {
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
      if (progress > Number.MAX_SAFE_INTEGER || progress < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); progress += Math?.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }

      setUploadProgress((prev) => ({
        ...prev,
        [fileName]: Math?.min(progress, 100),
      }));
    }, 200);
  };

  // Handle files processing
  const handleProcessFiles = (files: File[]) => {
    const validFiles = validateFiles(files);

    if (validFiles?.length > 0) {
      onFilesSelected([...selectedFiles, ...validFiles]);
    }
  };

  // Remove a file from the selection
  const handleRemoveFile = (fileToRemove: File) => {
    const updatedFiles = selectedFiles?.filter((file) => file !== fileToRemove);
    onFilesSelected(updatedFiles);

    // Remove progress entry for the file
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileToRemove?.name];
      return newProgress;
    });
  };

  return (
    <div className="space-y-4">
      <FileDropZone
        onFilesDrop={handleProcessFiles}
        acceptedFileTypes={acceptedFileTypes}
        maxFiles={maxFiles}
        currentFileCount={selectedFiles?.length}
        maxFileSize={maxFileSize}
        disabled={disabled}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        fileInputRef={fileInputRef}
      />

      <FileErrors errors={errors} />

      <FileList files={selectedFiles} progress={uploadProgress} onRemove={handleRemoveFile} />
    </div>
  );
}
