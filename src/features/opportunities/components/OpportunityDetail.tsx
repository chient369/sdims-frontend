import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getOpportunityById, 
  getOpportunityNotes, 
  assignLeaderToOpportunity,
  updateOnsitePriority,
  addOpportunityNote,
  getOpportunityAttachments,
  uploadOpportunityFiles,
  deleteOpportunityFile
} from '../api';
import { 
  Button,
  Badge,
  Spinner,
  Alert
} from '../../../components/ui';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../../components/modals';
import { FileUploader, FileList, FileInfo, FilePreview, FileViewer } from '../../../components/files';
import { usePermissions } from '../../../hooks/usePermissions';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { OpportunityNoteResponse, OpportunityAttachment, NewOpportunityResponse, EmployeeAssignment } from '../types';
import AssignLeaderModal from './AssignLeaderModal';
import { NoteInputForm, ActivityTimeline, AdvancedFiltering, FilterValues } from './notes';
import { useNotifications } from '../../../context/NotificationContext';

/**
 * Get the most recently assigned employee from employeeAssignments
 * @param employeeAssignments Array of employee assignments
 * @returns The most recently assigned employee or null if no assignments
 */
const getLatestAssignedEmployee = (employeeAssignments?: EmployeeAssignment[]): EmployeeAssignment | null => {
  if (!employeeAssignments || employeeAssignments.length === 0) {
    return null;
  }
  
  // Sort by assignedAt in descending order (newest first) and return the first one
  return [...employeeAssignments].sort((a, b) => 
    new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
  )[0];
};

/**
 * Opportunity Detail Page component
 * Displays detailed information about a specific opportunity
 * @returns {JSX.Element} The rendered component
 */
const OpportunityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { showToast } = useNotifications();
  
  // State
  const [opportunity, setOpportunity] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'files'>('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({});
  const [opportunityFiles, setOpportunityFiles] = useState<OpportunityAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<OpportunityAttachment | null>(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<OpportunityAttachment | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [notes, setNotes] = useState<OpportunityNoteResponse[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [notesPage, setNotesPage] = useState<number>(1);
  const [notesHasMore, setNotesHasMore] = useState<boolean>(true);

  // Ref để kiểm soát việc fetch
  const isFetchingRef = useRef(false);

  // Fetch opportunity data
  const fetchOpportunity = useCallback(async () => {
    // Ngăn chặn việc fetch nhiều lần
    if (isFetchingRef.current || !id) return;

    try {
      isFetchingRef.current = true;
      setLoading(true);
      
      const response = await getOpportunityById(id);
      
      // Xử lý nhiều định dạng API response khác nhau
      if (response && typeof response === 'object') {
        if ('status' in response && response.status === 'success' && 'data' in response) {
          // API mới trả về response.data.opportunity
          if (response.data && typeof response.data === 'object' && 'opportunity' in response.data) {
            setOpportunity(response.data.opportunity);
          } else {
            setOpportunity(response.data);
          }
        } else if ('opportunity' in response) {
          // Định dạng cũ trả về response.opportunity
          setOpportunity(response.opportunity);
        } else {
          // Trả về toàn bộ response nếu không khớp với các cấu trúc đã biết
          setOpportunity(response);
        }
      } else {
        setOpportunity(response);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin cơ hội');
      console.error('Error fetching opportunity:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [id]);

  // Fetch opportunity notes
  const fetchOpportunityNotes = useCallback(async (page: number = 1, refresh: boolean = false) => {
    if (!id || isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setNotesLoading(true);
      setNotesError(null);
      
      const queryParams = {
        ...filters,
        page,
        size: 20
      };
      
      const response = await getOpportunityNotes(id, queryParams);
      
      if (response && response.data) {
        // Xử lý notes từ API
        const newNotes = response.data || [];
        
        if (refresh) {
          setNotes(newNotes);
        } else {
          setNotes(prev => [...prev, ...newNotes]);
        }
        
        // Kiểm tra xem còn dữ liệu để load không
        if (response.pageable) {
          setNotesHasMore(page < response.pageable.totalPages);
          setNotesPage(page);
        } else {
          setNotesHasMore(false);
        }
      }
    } catch (err: any) {
      setNotesError(err.message || 'Không thể tải ghi chú');
      console.error('Error fetching notes:', err);
    } finally {
      setNotesLoading(false);
      isFetchingRef.current = false;
    }
  }, [id, filters]);

  // Fetch opportunity files
  const fetchOpportunityFiles = useCallback(async () => {
    if (!id || isFetchingRef.current) return;
    
    try {
      isFetchingRef.current = true;
      setFilesLoading(true);
      const response = await getOpportunityAttachments(id);
      setOpportunityFiles(response.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setFilesLoading(false);
      isFetchingRef.current = false;
    }
  }, [id]);

  // Handle tab change
  const handleTabChange = (tab: 'info' | 'notes' | 'files') => {
    setActiveTab(tab);
    
    // Load data cho tab notes nếu cần
    if (tab === 'notes' && notes.length === 0 && !notesLoading) {
      fetchOpportunityNotes(1, true);
    }
    
    // Load data cho tab files nếu cần
    if (tab === 'files' && opportunityFiles.length === 0 && !filesLoading) {
      fetchOpportunityFiles();
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/opportunities');
  };

  // Toggle onsite priority
  const handleToggleOnsitePriority = async () => {
    if (!opportunity || !id) return;
    try {
      const response = await updateOnsitePriority(id, {
        priority: !opportunity.priority
      });
      
      // Xử lý nhiều định dạng API response khác nhau
      if (response && typeof response === 'object') {
        if ('status' in response && response.status === 'success' && 'data' in response) {
          // API mới trả về response.data.opportunity
          if (response.data && typeof response.data === 'object' && 'opportunity' in response.data) {
            setOpportunity(response.data.opportunity);
          } else {
            setOpportunity((prev: any) => ({...prev, priority: !opportunity.priority}));
          }
        } else if ('opportunity' in response) {
          // Định dạng cũ trả về response.opportunity
          setOpportunity(response.opportunity);
        } else {
          // Trả về toàn bộ response nếu không khớp với các cấu trúc đã biết
          setOpportunity((prev: any) => ({...prev, priority: !opportunity.priority}));
        }
      } else {
        setOpportunity((prev: any) => ({...prev, priority: !opportunity.priority}));
      }
      
      showToast('success', 'Thành công', 'Cập nhật ưu tiên onsite thành công!');
    } catch (err) {
      showToast('error', 'Lỗi', 'Cập nhật ưu tiên onsite thất bại!');
      console.error('Error updating onsite priority:', err);
    }
  };

  // Open assign modal
  const handleOpenAssignModal = () => {
    setShowAssignModal(true);
  };

  // Close assign modal
  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
  };

  // Handle leader assignment
  const handleAssignLeader = async (leaderId: string, message?: string, notifyLeader?: boolean) => {
    if (!id) return;
    try {
      setShowAssignModal(false);
      // Gọi API để phân công leader
      await assignLeaderToOpportunity(id, {
        leaderId,
        message,
        notifyLeader
      });
      
      // Sau khi phân công thành công, tải lại thông tin cơ hội
      fetchOpportunity();
      showToast('success', 'Thành công', 'Phân công team thành công!');
    } catch (error) {
      console.error('Error assigning leader:', error);
      showToast('error', 'Lỗi', 'Phân công team thất bại. Vui lòng thử lại!');
    }
  };

  // Handle file change for file tab
  const handleFileChange = (files: File[]) => {
    // Only used in the files tab
    setAttachments(files);
  };

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (!id || files.length === 0) return;
    
    try {
      setUploadingFiles(true);
      setFileUploadError(null);
      
      await uploadOpportunityFiles(id, files);
      
      // Refresh file list
      fetchOpportunityFiles();
    } catch (err) {
      console.error('Error uploading files:', err);
      setFileUploadError('Không thể upload file, vui lòng thử lại');
    } finally {
      setUploadingFiles(false);
    }
  };

  // Handle file click to preview
  const handleFileClick = (file: OpportunityAttachment) => {
    setSelectedFile(file);
    setShowFileViewer(true);
  };

  // Handle file delete click
  const handleDeleteClick = (file: OpportunityAttachment) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  // Confirm file deletion
  const handleConfirmDelete = async () => {
    if (!id || !fileToDelete) return;
    
    try {
      setDeletingFile(true);
      setDeleteError(null);
      
      await deleteOpportunityFile(id, fileToDelete.id);
      
      // Refresh file list
      fetchOpportunityFiles();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting file:', err);
      setDeleteError('Không thể xóa file, vui lòng thử lại');
    } finally {
      setDeletingFile(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    // Khi thay đổi bộ lọc, load lại từ trang đầu tiên
    fetchOpportunityNotes(1, true);
  };

  // Load more notes
  const handleLoadMoreNotes = () => {
    if (notesHasMore && !notesLoading) {
      fetchOpportunityNotes(notesPage + 1);
    }
  };

  // Initial data loading
  useEffect(() => {
    // Chỉ gọi khi id thay đổi và chưa fetch
    if (id && !opportunity) {
      fetchOpportunity();
    }
  }, [id, opportunity, fetchOpportunity]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Lỗi">
          {error || 'Không tìm thấy thông tin cơ hội'}
        </Alert>
        <div className="mt-4">
          <Button onClick={handleBack}>Quay lại</Button>
        </div>
      </div>
    );
  }

  // Determine follow-up status color
  const getFollowUpStatusColor = (status: string) => {
    switch (status) {
      case 'Red':
        return 'error';
      case 'Yellow':
        return 'warning';
      case 'Green':
        return 'success';
      default:
        return 'default';
    }
  };

  // Map deal stage to readable status
  const getDealStageText = (status: string) => {
    switch (status) {
      case 'PROSPECTING':
        return 'Tiếp cận khách hàng';
      case 'QUALIFICATION':
        return 'Xác định tiềm năng';
      case 'NEEDS_ANALYSIS':
        return 'Phân tích nhu cầu';
      case 'VALUE_PROPOSITION':
        return 'Đề xuất giá trị';
      case 'PROPOSAL':
        return 'Gửi đề xuất';
      case 'NEGOTIATION':
        return 'Đàm phán';
      case 'DISCOVERY':
        return 'Khám phá nhu cầu';
      case 'CLOSED_WON':
        return 'Đã chốt (Thành công)';
      case 'CLOSED_LOST':
        return 'Đã chốt (Thất bại)';
      default:
        return status;
    }
  }

  // Map deal stage to badge color
  const getDealStageBadgeClass = (status: string) => {
    switch (status) {
      case 'PROSPECTING':
      case 'QUALIFICATION':
      case 'DISCOVERY':
        return 'bg-blue-100 text-blue-800';
      case 'NEEDS_ANALYSIS':
      case 'VALUE_PROPOSITION':
        return 'bg-purple-100 text-purple-800';
      case 'PROPOSAL':
      case 'NEGOTIATION':
        return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED_WON':
        return 'bg-green-100 text-green-800';
      case 'CLOSED_LOST':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Lấy thông tin từ API mới
  const opportunityName = opportunity.name || '';
  const opportunityDescription = opportunity.description || '';
  const opportunityCode = opportunity.code || '';
  const estimatedValue = opportunity.amount || 0;
  const currency = opportunity.currency || 'VND';
  const dealStage = opportunity.status || 'new';
  const createdAt = opportunity.createdAt || '';
  const closingDate = opportunity.closingDate || '';
  const createdBy = opportunity.createdBy || { id: '', name: 'Unknown User' };
  const assignedTo = opportunity.assignedTo || null;
  const priority = opportunity.priority || false;
  const tags = opportunity.tags || [];
  
  // Xây dựng thông tin khách hàng từ các trường mới
  const customerDetails = {
    name: opportunity.customerName || '',
    contact: opportunity.customerContact || '',
    email: opportunity.customerEmail || '',
    phone: opportunity.customerPhone || '',
    address: '',
    website: ''
  };

  return (
    <div className="p-0">
      {/* Header with back button */}
      <div className="flex items-center p-4 border-b">
        <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold">Chi tiết cơ hội</h1>
          <p className="text-sm text-gray-500">{opportunityDescription}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="bg-white rounded-md shadow-sm p-6 mb-6">
          {/* Header Section with Estimated Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">Giá trị ước tính</p>
              <p className="text-2xl font-bold">
                {formatCurrency(estimatedValue, currency)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Leader được assign</p>
              <div className="flex items-center mt-1">
                {/* Get latest assigned employee from employeeAssignments */}
                {(() => {
                  const latestAssignedEmployee = getLatestAssignedEmployee(opportunity.employeeAssignments);
                  
                  if (latestAssignedEmployee) {
                    return (
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm mr-2">
                          {latestAssignedEmployee.employeeName.charAt(0)}
                        </div>
                        <div>
                          <p>{latestAssignedEmployee.employeeName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(latestAssignedEmployee.assignedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    );
                  } else if (assignedTo) {
                    return (
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm mr-2">
                          {assignedTo.name.charAt(0)}
                        </div>
                        <p>{assignedTo.name}</p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center">
                        <Button 
                          onClick={handleOpenAssignModal} 
                          variant="secondary"
                          size="sm"
                          disabled={!can('opportunity-assign:update:all')}
                        >
                          Assign Leader
                        </Button>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Ưu tiên Onsite</p>
              <div className="mt-1">
                <div className="inline-flex items-center">
                  <input
                    type="checkbox"
                    id="onsitePriority"
                    checked={priority}
                    onChange={handleToggleOnsitePriority}
                    className="w-4 h-4"
                    disabled={!can('opportunity-onsite:update:all') && !can('opportunity-onsite:update:assigned')}
                  />
                  <label htmlFor="onsitePriority" className="ml-2 text-sm font-medium cursor-pointer">
                    {priority ? 'Có' : 'Không'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">Giai đoạn bán hàng</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 ${getDealStageBadgeClass(dealStage)} rounded-full text-xs`}>
                  {getDealStageText(dealStage)}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Mã cơ hội</p>
              <p className="text-gray-700 mt-1">
                {opportunityCode}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Ngày tạo</p>
              <p className="text-gray-700 mt-1">{formatDate(createdAt)}</p>
            </div>
          </div>
          
          {/* Deal Size & Source Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">Quy mô dự án</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 ${
                  opportunity.dealSize === 'LARGE' ? 'bg-purple-100 text-purple-800' :
                  opportunity.dealSize === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                  opportunity.dealSize === 'SMALL' ? 'bg-green-100 text-green-800' :
                  opportunity.dealSize === 'ENTERPRISE' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                } rounded-full text-xs`}>
                  {opportunity.dealSize || 'Chưa xác định'}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Nguồn</p>
              <p className="text-gray-700 mt-1">
                {opportunity.source || 'Chưa xác định'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Mã tham chiếu</p>
              <p className="text-gray-700 mt-1">
                {opportunity.externalId || 'N/A'}
              </p>
            </div>
          </div>
          
          {/* Third Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">Người phụ trách Sales</p>
              <div className="flex items-center mt-1">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm mr-2">
                  {createdBy.name.charAt(0)}
                </div>
                <p>{createdBy.name}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Khách hàng</p>
              <div className="mt-1">
                <p className="font-medium">{customerDetails.name || 'N/A'}</p>
                {customerDetails.contact && (
                  <p className="text-sm text-gray-600">
                    Liên hệ: {customerDetails.contact}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Ngày đóng dự kiến</p>
              <p className="text-gray-700 mt-1">
                {closingDate 
                  ? formatDate(closingDate) 
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Action buttons area */}
          <div className="mt-6 mb-4 flex flex-wrap gap-4">
            <Button 
              onClick={handleOpenAssignModal} 
              variant="default" 
              size="md"
              disabled={!can('opportunity-assign:update:all')}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              Assign Leader
            </Button>
            
            <button
              className="inline-flex items-center justify-center gap-1 h-10 px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {
                if (can('opportunity-note:create:all') || can('opportunity-note:create:assigned')) {
                  handleTabChange('notes');
                  setTimeout(() => {
                    const textarea = document.querySelector('textarea');
                    if (textarea) textarea.focus();
                  }, 100);
                }
              }}
              disabled={!can('opportunity-note:create:all') && !can('opportunity-note:create:assigned')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Thêm ghi chú
            </button>
            
            <Button 
              variant="outline" 
              size="md"
              className="flex items-center gap-1"
              onClick={() => window.open('https://app.hubspot.com', '_blank')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Xem trên Hubspot
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="mt-4 border-t pt-4">
            <nav className="flex gap-6">
              <button
                className={`py-2 ${activeTab === 'info' 
                  ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleTabChange('info')}
              >
                Chi tiết
              </button>
              
              <button
                className={`py-2 ${activeTab === 'notes' 
                  ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleTabChange('notes')}
              >
                Lịch sử tương tác
              </button>
              
              <button
                className={`py-2 ${activeTab === 'files' 
                  ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => handleTabChange('files')}
              >
                Tài liệu đính kèm
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* Tab: Chi tiết */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Mô tả</h3>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {opportunityDescription || 'Không có mô tả chi tiết.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Yêu cầu dự án</h3>
                  {tags && tags.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {tags.map((tag: string, index: number) => (
                        <li key={index}>{tag}</li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Phát triển trên nền tảng web-based</li>
                      <li>Tương thích với multiple devices</li>
                      <li>Tích hợp với hệ thống third-party</li>
                      <li>Thời gian triển khai dự kiến: 6 tháng</li>
                      <li>Yêu cầu bảo mật cao</li>
                    </ul>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Thông tin khách hàng</h3>
                  {customerDetails ? (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium mb-1">Tên: {customerDetails.name || 'N/A'}</p>
                      <p className="font-medium mb-1">Liên hệ: {customerDetails.contact || 'N/A'}</p>
                      <p className="font-medium mb-1">Email: {customerDetails.email || 'N/A'}</p>
                      <p className="font-medium mb-1">SĐT: {customerDetails.phone || 'N/A'}</p>
                      <p className="font-medium mb-1">Địa chỉ: {customerDetails.address || 'N/A'}</p>
                      <p className="font-medium">Website: {customerDetails.website || 'N/A'}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium mb-1">Không có thông tin khách hàng</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Lịch sử tương tác */}
            {activeTab === 'notes' && (
              <div>
                {/* Note input form */}
                {(can('opportunity-note:create:all') || can('opportunity-note:create:assigned')) && (
                  <NoteInputForm
                    opportunityId={id || ''}
                    onSuccess={() => {
                      // Reload notes when a new note is added
                      fetchOpportunityNotes(1, true);
                    }}
                  />
                )}
                
                {/* Advanced filtering */}
                <AdvancedFiltering 
                  onFilterChange={handleFilterChange}
                />
                
                {/* Activity timeline */}
                <ActivityTimeline
                  opportunityId={id || ''}
                  filter={filters}
                  notes={notes}
                  isLoading={notesLoading}
                  error={notesError}
                  hasMore={notesHasMore}
                  onLoadMore={handleLoadMoreNotes}
                />
              </div>
            )}

            {/* Tab: Tài liệu đính kèm */}
            {activeTab === 'files' && (
              <div>
                {/* Upload form */}
                {(can('contract-file:create:all') || can('contract-file:create:own')) && (
                  <div className="mb-6 bg-gray-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-3">Tải lên tài liệu mới</h3>
                    <div className="space-y-4">
                      <FileUploader
                        onFilesChange={handleFileUpload}
                        multiple={true}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip,.rar"
                        maxSize={20971520} // 20MB
                        label="Kéo thả file vào đây hoặc click để chọn file"
                        disabled={uploadingFiles}
                      />
                      
                      {fileUploadError && (
                        <Alert variant="error">
                          {fileUploadError}
                        </Alert>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Files list */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Tài liệu đã đính kèm</h3>
                  
                  {filesLoading ? (
                    <div className="py-6 flex justify-center">
                      <Spinner />
                    </div>
                  ) : opportunityFiles.length === 0 ? (
                    <div className="py-6 text-center text-gray-500">
                      Chưa có tài liệu nào được đính kèm
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {opportunityFiles.map((file) => {
                        // Convert to FileInfo format for the FilePreview component
                        const fileInfo: FileInfo = {
                          id: file.id,
                          name: file.fileName,
                          type: file.fileType,
                          size: file.fileSize,
                          uploadedAt: new Date(file.createdAt),
                          url: file.downloadUrl,
                          thumbnailUrl: file.thumbnailUrl
                        };
                        
                        return (
                          <FilePreview 
                            key={file.id}
                            file={fileInfo}
                            onClick={() => handleFileClick(file)}
                            onRemove={can('contract-file:delete:all') || (can('contract-file:delete:own') && opportunity?.createdBy.id === file.createdBy.id) 
                              ? () => handleDeleteClick(file) 
                              : undefined
                            }
                            className="h-full"
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Leader Modal */}
      {showAssignModal && (
        <AssignLeaderModal
          opportunityId={id || ''}
          opportunityName={opportunity.name}
          onClose={handleCloseAssignModal}
          onAssign={handleAssignLeader}
        />
      )}

      {/* File Viewer Modal */}
      {selectedFile && (
        <FileViewer
          file={{
            id: selectedFile.id,
            name: selectedFile.fileName,
            type: selectedFile.fileType,
            size: selectedFile.fileSize,
            url: selectedFile.downloadUrl,
            uploadedAt: new Date(selectedFile.createdAt)
          }}
          isOpen={showFileViewer}
          onClose={() => setShowFileViewer(false)}
        />
      )}

      {/* Delete File Confirmation Modal */}
      {showDeleteModal && fileToDelete && (
        <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <ModalHeader>Xác nhận xóa</ModalHeader>
          <ModalBody>
            <p>Bạn có chắc muốn xóa file "{fileToDelete.fileName}"?</p>
            {deleteError && (
              <Alert variant="error" className="mt-3">
                {deleteError}
              </Alert>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)}
              disabled={deletingFile}
            >
              Hủy
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmDelete}
              isLoading={deletingFile}
            >
              Xóa
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default OpportunityDetail; 