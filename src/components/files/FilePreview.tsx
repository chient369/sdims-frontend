import React from 'react';
import {
  DocumentIcon,
  PhotographIcon,
  DocumentTextIcon,
  TableIcon,
  FilmIcon,
  MusicNoteIcon,
  CodeIcon,
  ArchiveIcon,
  XIcon
} from '@heroicons/react/outline';
import { cn } from '../../utils/cn';

/**
 * FileInfo interface representing a file's metadata
 */
export interface FileInfo {
  id: string;
  name: string;
  url?: string;
  type: string;
  size: number;
  uploadedAt: Date;
  thumbnailUrl?: string;
}

/**
 * FilePreview component for displaying file previews with appropriate icons
 * @param {FileInfo} file - The file information to preview
 * @param {Function} onClick - Optional callback when the preview is clicked
 * @param {Function} onRemove - Optional callback to remove the file
 * @param {string} className - Additional CSS class names
 * @returns {JSX.Element} The rendered file preview
 */
interface FilePreviewProps {
  file: FileInfo;
  onClick?: (file: FileInfo) => void;
  onRemove?: (file: FileInfo) => void;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onClick,
  onRemove,
  className,
}) => {
  const { name, type, size, thumbnailUrl } = file;
  
  const isImage = type.startsWith('image/');
  const isPdf = type === 'application/pdf';
  const isVideo = type.startsWith('video/');
  const isAudio = type.startsWith('audio/');
  const isSpreadsheet = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
  ].includes(type);
  const isDocument = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
  ].includes(type);
  const isCode = [
    'text/plain',
    'text/html',
    'text/javascript',
    'application/json',
  ].includes(type);
  const isArchive = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
  ].includes(type);
  
  const getFileIcon = () => {
    if (isImage) return <PhotographIcon className="w-10 h-10 text-blue-500" />;
    if (isPdf) return <DocumentTextIcon className="w-10 h-10 text-red-500" />;
    if (isVideo) return <FilmIcon className="w-10 h-10 text-purple-500" />;
    if (isAudio) return <MusicNoteIcon className="w-10 h-10 text-green-500" />;
    if (isSpreadsheet) return <TableIcon className="w-10 h-10 text-emerald-500" />;
    if (isDocument) return <DocumentIcon className="w-10 h-10 text-blue-500" />;
    if (isCode) return <CodeIcon className="w-10 h-10 text-gray-500" />;
    if (isArchive) return <ArchiveIcon className="w-10 h-10 text-amber-500" />;
    return <DocumentIcon className="w-10 h-10 text-gray-500" />;
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };
  
  return (
    <div 
      className={cn(
        "flex border rounded-lg overflow-hidden bg-white transition-shadow hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={() => onClick?.(file)}
    >
      <div className="w-16 h-16 shrink-0 bg-gray-100 flex items-center justify-center">
        {isImage && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          getFileIcon()
        )}
      </div>
      
      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {name}
          </h3>
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(file);
              }}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {formatFileSize(size)}
        </p>
      </div>
    </div>
  );
}; 