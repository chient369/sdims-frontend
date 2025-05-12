import React, { useState } from 'react';
import { Modal } from '../modals/Modal';
import { ModalHeader } from '../modals/ModalHeader';
import { ModalBody } from '../modals/ModalBody';
import { Button } from '../ui/Button';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { FileInfo } from './FilePreview';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure pdf.js worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * FileViewer component for viewing files in a modal
 * @param {FileInfo|null} file - File information object to view
 * @param {boolean} isOpen - Whether the viewer modal is open
 * @param {Function} onClose - Callback when the modal is closed
 * @returns {JSX.Element|null} The rendered file viewer component or null if no file
 */
interface FileViewerProps {
  file: FileInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FileViewer: React.FC<FileViewerProps> = ({
  file,
  isOpen,
  onClose,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  
  if (!file) return null;
  
  const { name, type, url } = file;
  const isImage = type.startsWith('image/');
  const isPdf = type === 'application/pdf';
  
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }
  
  function changePage(offset: number) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }
  
  function previousPage() {
    changePage(-1);
  }
  
  function nextPage() {
    changePage(1);
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader className="flex justify-between items-center">
        <span className="truncate">{name}</span>
        {url && (
          <a
            href={url}
            download={name}
            className="flex items-center text-sm text-primary-600 hover:text-primary-800"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
            Download
          </a>
        )}
      </ModalHeader>
      <ModalBody className="p-0">
        <div className="bg-gray-100 min-h-[400px] flex items-center justify-center p-4">
          {isImage && url && (
            <img
              src={url}
              alt={name}
              className="max-w-full max-h-[600px] object-contain"
            />
          )}
          
          {isPdf && url && (
            <div className="w-full">
              <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
              
              {numPages && numPages > 1 && (
                <div className="flex items-center justify-center mt-4 space-x-4">
                  <Button
                    onClick={previousPage}
                    disabled={pageNumber <= 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <p className="text-sm">
                    Page {pageNumber} of {numPages}
                  </p>
                  <Button
                    onClick={nextPage}
                    disabled={pageNumber >= (numPages || 1)}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {!isImage && !isPdf && (
            <div className="text-center p-8">
              <p className="text-gray-500 mb-3">
                Preview not available for this file type
              </p>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Open File
                </a>
              )}
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}; 