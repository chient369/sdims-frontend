import React from 'react';
import { FileInfo, FilePreview } from './FilePreview';
import { cn } from '../../utils/cn';

/**
 * FileList component for displaying a list of files with previews
 * @param {FileInfo[]} files - Array of file information objects
 * @param {Function} onFileClick - Optional callback when a file is clicked
 * @param {Function} onFileRemove - Optional callback to remove a file
 * @param {string} emptyMessage - Message to display when no files are available
 * @param {string} className - Additional CSS class names
 * @returns {JSX.Element} The rendered file list component
 */
interface FileListProps {
  files: FileInfo[];
  onFileClick?: (file: FileInfo) => void;
  onFileRemove?: (file: FileInfo) => void;
  emptyMessage?: string;
  className?: string;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onFileClick,
  onFileRemove,
  emptyMessage = "No files uploaded",
  className,
}) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      {files.map((file) => (
        <FilePreview
          key={file.id}
          file={file}
          onClick={onFileClick}
          onRemove={onFileRemove}
        />
      ))}
    </div>
  );
}; 