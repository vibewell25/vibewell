import { UploadCloud } from 'lucide-react';
import React, { useRef, useState } from 'react';
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}
export {};
