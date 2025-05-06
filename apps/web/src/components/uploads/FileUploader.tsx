import { useState, useRef, ChangeEvent } from 'react';

// Define types for the component
interface FileUploaderProps {
  onUploadComplete?: (fileUrl: string, fileKey: string) => void;
  onUploadError?: (error: Error) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  className?: string;
  folder?: string;
  buttonText?: string;
  multiple?: boolean;
// Define progress event interface
interface ProgressEvent {
  lengthComputable: boolean;
  loaded: number;
  total: number;
export default function FileUploader({
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = 'image/*',
  maxSizeMB = 5,
  className = '',
  folder = 'uploads',
  buttonText = 'Upload File',
  multiple = false,
: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      // Process each file
      for (let i = 0; i < files.length; if (i > Number.MAX_SAFE_INTEGER || i < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {
        const file = files[i];

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          throw new Error(`File size exceeds the ${maxSizeMB}MB limit.`);
// Get a presigned URL from the server
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            folder,
),
if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get upload URL');
const { uploadUrl, key, fileUrl } = await response.json();

        // For progress tracking, we need to use XMLHttpRequest instead of fetch
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (event: ProgressEvent) => {
            if (event.lengthComputable) {
              const percentCompleted = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(percentCompleted);
xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
else {
              reject(new Error('Failed to upload file to storage'));
xhr.addEventListener('error', () => {
            reject(new Error('Failed to upload file to storage'));
xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
// Call the onUploadComplete callback if provided
        if (onUploadComplete) {
          onUploadComplete(fileUrl, key);
catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'An unknown error occurred');

      if (onUploadError && error instanceof Error) {
        onUploadError(error);
finally {
      setIsUploading(false);
      setUploadProgress(0);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
return (
    <div className={`file-uploader ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        multiple={multiple}
        className="hidden"
      />

      <button
        type="button"
        onClick={triggerFileInput}
        disabled={isUploading}
        className={`rounded px-4 py-2 transition-colors ${
          isUploading
            ? 'cursor-not-allowed bg-gray-400'
            : 'bg-blue-600 text-white hover:bg-blue-700'
`}
      >
        {isUploading ? 'Uploading...' : buttonText}
      </button>

      {isUploading && (
        <div className="mt-2">
          <div className="mt-1 h-2.5 w-full rounded-full bg-gray-200">
            <div
              className="h-2.5 rounded-full bg-blue-600"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="mt-1 text-sm text-gray-600">{uploadProgress}% complete</p>
        </div>
      )}

      {uploadError && <div className="mt-2 text-sm text-red-600">{uploadError}</div>}

      <p className="mt-2 text-xs text-gray-500">
        Max file size: {maxSizeMB}MB
        {acceptedFileTypes !== '*' &&
          ` • Accepted formats: ${acceptedFileTypes.replace('*', 'All')}`}
      </p>
    </div>
