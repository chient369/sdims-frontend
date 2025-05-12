import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  TrashIcon,
  DocumentIcon, 
  PhotoIcon, 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

import { useContractService } from '../../hooks/useContractService';
import { formatDate } from '../../../../utils/formatters';
import { 
  ATTACHMENTS_VALIDATION_MESSAGES, 
  WARNING_MESSAGES,
  GUIDANCE_MESSAGES 
} from '../../utils/validationMessages';
import {
  ATTACHMENT_CONFIG,
  BUSINESS_RULES,
  sanitizeFileName
} from '../../utils/validationConfig';

interface AttachmentsSectionProps {
  mode: 'create' | 'edit';
  isLoading: boolean;
  contractId?: string;
}

// Custom interface to avoid ContractFile type error
interface MockContractFile {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

/**
 * Attachments section for contract form.
 * Allows uploading, viewing, and managing contract attachments.
 */
export const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({ 
  mode, 
  isLoading, 
  contractId 
}) => {
  const [expanded, setExpanded] = useState(true);
  const [files, setFiles] = useState<MockContractFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldTouched, setFieldTouched] = useState(false);
  
  const { 
    register, 
    setValue, 
    watch, 
    formState: { errors, isSubmitted, touchedFields } 
  } = useFormContext();
  
  const contractService = useContractService();
  const queryClient = useQueryClient();
  
  // Fetch files if in edit mode
  const { data: filesData } = useQuery<MockContractFile[]>({
    queryKey: ['contract', contractId, 'files'],
    queryFn: async () => {
      if (!contractId) return [];
      
      // Mock API call
      return Promise.resolve([
        {
          id: 1,
          name: 'contract-draft.pdf',
          type: 'contract',
          size: 2500000,
          url: '#',
          uploadedAt: '2023-01-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'meeting-notes.docx',
          type: 'document',
          size: 350000,
          url: '#',
          uploadedAt: '2023-01-16T14:45:00Z'
        }
      ]);
    },
    enabled: !!contractId && mode === 'edit'
  });
  
  // Cập nhật state khi dữ liệu được tải thành công
  useEffect(() => {
    if (filesData) {
      setFiles(filesData);
      // Cập nhật giá trị cho react-hook-form
      setValue('attachments', filesData, { shouldValidate: true });
    }
  }, [filesData, setValue]);
  
  // Kiểm tra tính hợp lệ của file
  const validateFile = (file: File): {valid: boolean, errors: string[]} => {
    const errors: string[] = [];
    
    // Kiểm tra kích thước
    if (file.size > ATTACHMENT_CONFIG.maxFileSize) {
      errors.push(ATTACHMENTS_VALIDATION_MESSAGES.FILE_TOO_LARGE(
        file.name, 
        formatFileSize(file.size), 
        formatFileSize(ATTACHMENT_CONFIG.maxFileSize)
      ));
    }
    
    // Kiểm tra loại file
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    let isValidType = false;
    
    for (const [type, extensions] of Object.entries(ATTACHMENT_CONFIG.acceptedFileTypes)) {
      if ((extensions as string[]).includes(extension)) {
        isValidType = true;
        break;
      }
    }
    
    if (!isValidType) {
      errors.push(ATTACHMENTS_VALIDATION_MESSAGES.UNSUPPORTED_FILE_TYPE(
        file.name, 
        Object.values(ATTACHMENT_CONFIG.acceptedFileTypes).flat()
      ));
    }
    
    // Kiểm tra tên file hợp lệ
    if (!ATTACHMENT_CONFIG.fileNamePattern.test(file.name)) {
      errors.push(ATTACHMENTS_VALIDATION_MESSAGES.SPECIAL_CHARS_IN_FILENAME);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };
  
  // Kiểm tra các ràng buộc nghiệp vụ
  useEffect(() => {
    setFieldTouched(true);
    const newErrors: string[] = [];
    
    // Kiểm tra số lượng file
    if (files.length > ATTACHMENT_CONFIG.maxFiles) {
      newErrors.push(ATTACHMENTS_VALIDATION_MESSAGES.MAX_FILES_REACHED(ATTACHMENT_CONFIG.maxFiles));
    } else if (files.length >= ATTACHMENT_CONFIG.warningThresholds.fileCount) {
      newErrors.push(WARNING_MESSAGES.APPROACHING_FILE_LIMIT(files.length, ATTACHMENT_CONFIG.maxFiles));
    }
    
    // Tính tổng dung lượng file
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > ATTACHMENT_CONFIG.totalMaxSize) {
      newErrors.push(ATTACHMENTS_VALIDATION_MESSAGES.TOTAL_SIZE_EXCEEDED);
    } else if (totalSize >= ATTACHMENT_CONFIG.warningThresholds.totalSize) {
      newErrors.push(WARNING_MESSAGES.APPROACHING_SIZE_LIMIT(
        formatFileSize(totalSize), 
        formatFileSize(ATTACHMENT_CONFIG.totalMaxSize)
      ));
    }
    
    // Kiểm tra file bắt buộc chỉ khi đã submit hoặc đã chạm
    if ((isSubmitted || fieldTouched) && files.length > 0 && BUSINESS_RULES.attachments.requireContractFile) {
      // Kiểm tra xem đã có file hợp đồng chưa
      const hasContractFile = files.some(file => 
        file.type === 'contract' || 
        file.name.toLowerCase().endsWith('.pdf')
      );
      
      if (!hasContractFile) {
        newErrors.push(ATTACHMENTS_VALIDATION_MESSAGES.NO_CONTRACT_FILE);
      }
    }
    
    // Kiểm tra số lượng file tối thiểu khi đã submit
    if ((isSubmitted || fieldTouched) && files.length < BUSINESS_RULES.attachments.minRequiredFiles) {
      newErrors.push(`Cần đính kèm ít nhất ${BUSINESS_RULES.attachments.minRequiredFiles} file.`);
    }
    
    // Cập nhật state lỗi
    setValidationErrors(newErrors);
    
    // Cập nhật giá trị cho react-hook-form
    setValue('attachments', files, { 
      shouldValidate: isSubmitted || fieldTouched, 
      shouldDirty: true 
    });
  }, [files, isSubmitted, fieldTouched, setValue]);
  
  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (data: { contractId: string, file: File, type: string }) => {
      // Kiểm tra file trước khi upload
      const validation = validateFile(data.file);
      
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Chuẩn hóa tên file nếu cần
      let fileName = data.file.name;
      if (!ATTACHMENT_CONFIG.fileNamePattern.test(fileName)) {
        fileName = sanitizeFileName(fileName);
      }
      
      // Mock API call
      return new Promise<MockContractFile>((resolve, reject) => {
        // Giả lập tiến trình upload
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            
            // Giả lập API response
            resolve({
              id: Math.floor(Math.random() * 1000),
              name: fileName,
              type: data.type,
              size: data.file.size,
              url: '#',
              uploadedAt: new Date().toISOString()
            });
          }
        }, 300);
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId, 'files'] });
      setUploading(false);
      setUploadProgress(0);
      setFieldTouched(true);
      
      // Cập nhật state files ngay lập tức để UI nhanh chóng phản hồi
      setFiles(prev => [...prev, data]);
    },
    onError: (error: Error) => {
      // Hiển thị lỗi
      setValidationErrors(prev => [...prev, error.message]);
      setUploading(false);
      setUploadProgress(0);
    }
  });
  
  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      // Mock API call
      return Promise.resolve({ success: true });
    },
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId, 'files'] });
      setFieldTouched(true);
      
      // Cập nhật state files ngay lập tức để UI nhanh chóng phản hồi
      setFiles(prev => prev.filter(file => file.id !== fileId));
    }
  });
  
  // Handle file upload via input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };
  
  // Handle file upload via drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };
  
  // Handle file upload common logic
  const handleUpload = (file: File) => {
    if (!contractId) return;
    
    // Kiểm tra số lượng file trước khi upload
    if (files.length >= ATTACHMENT_CONFIG.maxFiles) {
      setValidationErrors(prev => [...prev, ATTACHMENTS_VALIDATION_MESSAGES.MAX_FILES_REACHED(ATTACHMENT_CONFIG.maxFiles)]);
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setFieldTouched(true);
    
    // Determine file type from extension
    const fileName = file.name.toLowerCase();
    let fileType = 'document';
    
    if (fileName.endsWith('.pdf')) {
      fileType = 'contract';
    } else if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) {
      fileType = 'image';
    } else if (/\.(doc|docx)$/i.test(fileName)) {
      fileType = 'document';
    } else if (/\.(xls|xlsx|csv)$/i.test(fileName)) {
      fileType = 'spreadsheet';
    } else if (/\.(ppt|pptx)$/i.test(fileName)) {
      fileType = 'presentation';
    }
    
    // Kiểm tra file hợp đồng không phải PDF
    if (fileType === 'contract' && !fileName.endsWith('.pdf')) {
      setValidationErrors(prev => [...prev, ATTACHMENTS_VALIDATION_MESSAGES.NON_PDF_CONTRACT]);
    }
    
    // Execute upload
    uploadFileMutation.mutate({
      contractId,
      file,
      type: fileType
    });
  };
  
  // Handle file delete
  const handleDeleteFile = (fileId: number, fileType: string) => {
    // Kiểm tra xem file có phải loại bắt buộc không
    if (fileType === 'contract' && BUSINESS_RULES.attachments.requireContractFile) {
      // Đếm số lượng file hợp đồng còn lại
      const contractFilesCount = files.filter(f => 
        (f.type === 'contract' || f.name.toLowerCase().endsWith('.pdf')) && 
        f.id !== fileId
      ).length;
      
      if (contractFilesCount === 0) {
        setValidationErrors(prev => [...prev, ATTACHMENTS_VALIDATION_MESSAGES.CANT_DELETE_LAST_CONTRACT]);
        return;
      }
    }
    
    setFieldTouched(true);
    deleteFileMutation.mutate(fileId);
  };
  
  // Determine file icon based on type
  const getFileIcon = (fileType: string, fileName: string) => {
    if (fileType === 'image' || /\.(jpg|jpeg|png|gif)$/i.test(fileName.toLowerCase())) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    } else if (fileType === 'contract' || fileName.toLowerCase().endsWith('.pdf')) {
      return <DocumentTextIcon className="w-8 h-8 text-red-500" />;
    } else {
      return <DocumentIcon className="w-8 h-8 text-gray-500" />;
    }
  };
  
  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Hàm format kích thước file
  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };
  
  // Xác định loại thông báo (error/warning)
  const getValidationErrorType = (message: string): 'error' | 'warning' => {
    // Kiểm tra nếu thông báo là cảnh báo
    const isWarning = Object.values(WARNING_MESSAGES).some(warningMsg => {
      if (typeof warningMsg === 'function') return false;
      return message.includes(warningMsg);
    });
    
    return isWarning ? 'warning' : 'error';
  };
  
  // Tách các thông báo thành lỗi và cảnh báo
  const separateValidationMessages = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    validationErrors.forEach(message => {
      if (getValidationErrorType(message) === 'error') {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    });
    
    return { errors, warnings };
  };
  
  // Lọc thông báo lỗi chỉ hiển thị khi đã submit hoặc đã chạm
  const { errors: errorMessages, warnings: warningMessages } = separateValidationMessages();
  const shouldShowErrors = isSubmitted || fieldTouched;
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Section Header */}
      <div 
        className="px-4 py-5 sm:px-6 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg leading-6 font-medium text-gray-900">Tài liệu đính kèm</h3>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500"
        >
          {expanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </button>
      </div>

      {/* Section Content */}
      {expanded && (
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {/* Validation errors */}
          {shouldShowErrors && errorMessages.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
              <div className="flex items-start">
                <ShieldExclamationIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Lỗi tài liệu đính kèm</h3>
                  <ul className="mt-1 text-sm text-red-700 list-disc pl-5">
                    {errorMessages.map((error, idx) => (
                      <li key={`error-${idx}`}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Validation warnings */}
          {warningMessages.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Lưu ý về tài liệu đính kèm</h3>
                  <ul className="mt-1 text-sm text-yellow-700 list-disc pl-5">
                    {warningMessages.map((warning, idx) => (
                      <li key={`warning-${idx}`}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* File upload guidelines */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Hướng dẫn tải file</h3>
                <ul className="mt-1 text-sm text-blue-700 list-disc pl-5">
                  <li>Mỗi file không vượt quá {formatFileSize(ATTACHMENT_CONFIG.maxFileSize)}</li>
                  <li>Tối đa {ATTACHMENT_CONFIG.maxFiles} file đính kèm</li>
                  <li>Định dạng được hỗ trợ: {Object.values(ATTACHMENT_CONFIG.acceptedFileTypes).flat().join(', ').toUpperCase()}</li>
                  <li>Tổng dung lượng tất cả file không vượt quá {formatFileSize(ATTACHMENT_CONFIG.totalMaxSize)}</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Upload area */}
          {mode === 'edit' && contractId &&
            <div 
              className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : shouldShowErrors && errorMessages.length > 0 
                    ? 'border-red-300 hover:border-red-400' 
                    : 'border-gray-300 hover:border-indigo-400'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                disabled={isLoading || uploading}
                {...register('attachmentInput', {
                  onChange: handleFileChange
                })}
              />
              
              <ArrowDownTrayIcon className={`w-10 h-10 mb-3 ${
                shouldShowErrors && errorMessages.length > 0 
                  ? 'text-red-400' 
                  : 'text-gray-400'
              }`} />
              
              <p className="text-sm text-gray-600">
                {dragActive 
                  ? "Thả file để upload..." 
                  : "Kéo thả file vào đây, hoặc click để chọn file"}
              </p>
              
              <p className="text-xs text-gray-500 mt-1">
                {GUIDANCE_MESSAGES.UPLOAD_FILE_HELP}
              </p>
              
              {uploading && (
                <div className="w-full mt-4">
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>Đang tải lên...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          }
          
          {/* File list */}
          {files.length > 0 ? (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Danh sách tài liệu ({files.length})</h4>
              <ul className="mt-3 divide-y divide-gray-200">
                {files.map(file => (
                  <li key={file.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      {getFileIcon(file.type, file.name)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span className="mx-1">•</span>
                          <span>{formatDate(file.uploadedAt)}</span>
                          <span className="mx-1">•</span>
                          <span className="capitalize">{file.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a 
                        href={file.url}
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem
                      </a>
                      {mode === 'edit' && (
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900 font-medium text-sm"
                          onClick={() => handleDeleteFile(file.id, file.type)}
                          disabled={isLoading}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className={`text-center py-8 ${shouldShowErrors && errorMessages.length > 0 ? 'text-red-500' : 'text-gray-500'}`}>
              <DocumentIcon className={`mx-auto h-12 w-12 ${shouldShowErrors && errorMessages.length > 0 ? 'text-red-400' : 'text-gray-400'}`} />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có tài liệu</h3>
              <p className="mt-1 text-sm text-gray-500">Tải lên file để đính kèm với hợp đồng.</p>
              {shouldShowErrors && errorMessages.length > 0 && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  Vui lòng đính kèm ít nhất {BUSINESS_RULES.attachments.minRequiredFiles} file
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 