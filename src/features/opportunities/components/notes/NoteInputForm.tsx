import { useState, useRef, useEffect } from 'react';
import { usePermissions } from '../../../../hooks/usePermissions';
import { addOpportunityNote } from '../../api';
import { Button, Alert } from '../../../../components/ui';

interface NoteInputFormProps {
  opportunityId: string;
  onSuccess: () => void;
  onCancel?: () => void;
  expanded?: boolean;
}

/**
 * NoteInputForm component for creating new notes/activities for opportunities
 * @param {string} opportunityId - ID of the opportunity to add notes to
 * @param {Function} onSuccess - Callback function when note is successfully added
 * @param {Function} onCancel - Optional callback function when form is cancelled
 * @param {boolean} expanded - Whether the form is expanded by default
 * @returns {JSX.Element} The rendered form component
 */
const NoteInputForm: React.FC<NoteInputFormProps> = ({
  opportunityId,
  onSuccess,
  onCancel,
  expanded = false
}) => {
  // State
  const [content, setContent] = useState('');
  const [activityType, setActivityType] = useState('internal-note');
  const [tags, setTags] = useState<string[]>([]);
  const [isInteraction, setIsInteraction] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [isDirty, setIsDirty] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Permissions
  const { can } = usePermissions();
  const canAddNote = can('opportunity-note:create:all') || can('opportunity-note:create:assigned');
  
  // Effects
  
  // Save draft when unmounting if content exists
  useEffect(() => {
    return () => {
      if (isDirty && content.trim()) {
        localStorage.setItem(`opportunity-note-draft-${opportunityId}`, content);
      }
    };
  }, [isDirty, content, opportunityId]);
  
  // Check for existing draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`opportunity-note-draft-${opportunityId}`);
    if (draft) {
      setContent(draft);
      setIsDirty(true);
      setIsExpanded(true);
    }
  }, [opportunityId]);
  
  // Handlers
  
  /**
   * Submit form data to API
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung ghi chú');
      return;
    }
    
    if (!canAddNote) {
      setError('Bạn không có quyền thêm ghi chú');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await addOpportunityNote(opportunityId, {
        content,
        attachments,
        type: activityType,
        tags,
        isInteraction
      });
      
      // Clear form and draft
      setContent('');
      setActivityType('internal-note');
      setTags([]);
      setIsInteraction(true);
      setAttachments([]);
      setIsDirty(false);
      localStorage.removeItem(`opportunity-note-draft-${opportunityId}`);
      
      // Collapse form if it was initially collapsed
      if (!expanded) {
        setIsExpanded(false);
      }
      
      // Call success callback
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Không thể thêm ghi chú. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Toggle form expansion
   */
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...fileList]);
      setIsDirty(true);
    }
  };
  
  /**
   * Remove selected file
   */
  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  /**
   * Trigger file input click
   */
  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };
  
  /**
   * Handle content change and set form as dirty
   */
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };
  
  /**
   * Handle tag selection
   */
  const handleTagChange = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
    setIsDirty(true);
  };
  
  /**
   * Cancel form and reset
   */
  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('Bạn có chắc chắn muốn hủy nhập ghi chú này?')) {
        setContent('');
        setActivityType('internal-note');
        setTags([]);
        setIsInteraction(true);
        setAttachments([]);
        setIsDirty(false);
        localStorage.removeItem(`opportunity-note-draft-${opportunityId}`);
        
        if (!expanded) {
          setIsExpanded(false);
        }
        
        if (onCancel) {
          onCancel();
        }
      }
    } else {
      if (!expanded) {
        setIsExpanded(false);
      }
      
      if (onCancel) {
        onCancel();
      }
    }
  };
  
  // Render collapsed view
  if (!isExpanded) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-4 transition-all duration-300 hover:shadow-md">
        <button
          onClick={toggleExpand}
          className="w-full py-2 px-4 flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
          disabled={!canAddNote}
        >
          <span className="mr-2">+ Thêm ghi chú mới</span>
        </button>
      </div>
    );
  }
  
  // Render expanded form
  return (
    <div className="bg-white rounded-lg shadow p-5 mb-6 transition-all duration-300">
      <h3 className="text-lg font-medium mb-4">Thêm ghi chú/hoạt động mới</h3>
      
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <form ref={formRef} onSubmit={handleSubmit}>
        {/* Activity type selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại hoạt động
          </label>
          <select
            value={activityType}
            onChange={(e) => {
              setActivityType(e.target.value);
              setIsDirty(true);
            }}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="internal-note">Ghi chú nội bộ</option>
            <option value="call">Cuộc gọi</option>
            <option value="email">Email</option>
            <option value="meeting">Cuộc họp</option>
            <option value="task">Công việc</option>
          </select>
        </div>
        
        {/* Content with rich text (basic textarea for now) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={handleContentChange}
            rows={5}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Nhập nội dung ghi chú..."
            disabled={isSubmitting}
          />
        </div>
        
        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {['Quan trọng', 'Theo dõi', 'Khẩn cấp', 'Tư vấn', 'Demo'].map((tag) => (
              <span
                key={tag}
                onClick={() => handleTagChange(tag)}
                className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                  tags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Update last interaction checkbox */}
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isInteraction"
            checked={isInteraction}
            onChange={(e) => {
              setIsInteraction(e.target.checked);
              setIsDirty(true);
            }}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <label htmlFor="isInteraction" className="ml-2 block text-sm text-gray-700">
            Tính là tương tác (cập nhật Last Interaction Date)
          </label>
        </div>
        
        {/* File attachments */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tệp đính kèm
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={handleAttachClick}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Đính kèm tệp
          </button>
          
          {/* Show selected files */}
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm truncate" style={{ maxWidth: '80%' }}>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-500 hover:text-red-700"
                    disabled={isSubmitting}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting || !content.trim() || !canAddNote}
            isLoading={isSubmitting}
          >
            Thêm ghi chú
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NoteInputForm; 