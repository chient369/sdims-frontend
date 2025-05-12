import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection, Accept } from 'react-dropzone';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';

/**
 * FileUploader component for uploading files with drag & drop support.
 * @param {Function} onUpload - Callback function to handle uploaded files.
 * @param {number} maxFiles - Maximum number of files allowed.
 * @param {number} maxSize - Maximum file size allowed in bytes.
 * @param {string} accept - Accepted file types.
 * @param {string} className - Additional CSS class names.
 * @param {boolean} disabled - Whether the uploader is disabled.
 * @returns {JSX.Element} The rendered file uploader component.
 */
export interface FileUploaderProps {
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: Accept | string;
  maxSize?: number;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesChange,
  multiple = false,
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  label,
  className,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const handleUpload = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    // Simulate progress with intervals
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      await onFilesChange(acceptedFiles);
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    } finally {
      clearInterval(progressInterval);
    }
  }, [onFilesChange]);
  
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const errors = fileRejections.map(rejection => {
        if (rejection.errors[0].code === 'file-too-large') {
          return `${rejection.file.name} is too large`;
        }
        if (rejection.errors[0].code === 'file-invalid-type') {
          return `${rejection.file.name} has an invalid file type`;
        }
        return rejection.errors[0].message;
      });
      setError(errors.join(', '));
      return;
    }
    
    handleUpload(acceptedFiles);
  }, [handleUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: multiple ? undefined : 1,
    maxSize,
    accept,
    disabled: disabled || uploading,
  });
  
  return (
    <div className={cn("w-full", className)}>
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
          isDragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400",
          disabled && "opacity-50 cursor-not-allowed",
          uploading && "pointer-events-none",
          className
        )}
      >
        <input {...getInputProps()} />
        
        <ArrowUpTrayIcon className="w-10 h-10 text-gray-400 mb-3" />
        
        <p className="text-sm text-gray-600">
          {isDragActive 
            ? "Drop the files here..." 
            : "Drag & drop files here, or click to select files"}
        </p>
        
        <p className="text-xs text-gray-500 mt-1">
          {`Max ${multiple ? 'multiple' : '1'} file, up to ${(maxSize / (1024 * 1024)).toFixed(0)}MB each`}
        </p>
        
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="mt-3"
          disabled={disabled || uploading}
        >
          Select Files
        </Button>
      </div>
      
      {uploading && (
        <div className="mt-3">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}
      
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600 flex items-start">
          <span className="flex-1">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}; 