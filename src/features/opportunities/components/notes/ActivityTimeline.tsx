import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getOpportunityNotes } from '../../api';
import { OpportunityNoteResponse } from '../../types';
import { Spinner, Alert } from '../../../../components/ui';

interface ActivityTimelineProps {
  opportunityId: string;
  filter?: {
    activityTypes?: string[];
    dateRange?: { from: Date | null; to: Date | null };
    createdBy?: string[];
    tags?: string[];
    searchText?: string;
  };
  limit?: number;
}

/**
 * ActivityTimeline component displays a timeline of notes and activities
 * for an opportunity
 * @param {string} opportunityId - ID of the opportunity to get activities for
 * @param {Object} filter - Optional filters to apply
 * @param {number} limit - Number of activities to fetch per page
 * @returns {JSX.Element} The rendered component
 */
const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  opportunityId,
  filter,
  limit = 10
}) => {
  // State
  const [activities, setActivities] = useState<OpportunityNoteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Fetch activities
  const fetchActivities = useCallback(
    async (page: number, replace: boolean = false) => {
      try {
        setLoading(page === 1);
        setLoadingMore(page > 1);
        setError(null);
        
        const params: any = {
          page,
          limit,
        };
        
        // Add filters if provided
        if (filter) {
          if (filter.activityTypes?.length) {
            params.types = filter.activityTypes.join(',');
          }
          
          if (filter.dateRange?.from) {
            params.createdFrom = filter.dateRange.from.toISOString();
          }
          
          if (filter.dateRange?.to) {
            params.createdTo = filter.dateRange.to.toISOString();
          }
          
          if (filter.createdBy?.length) {
            params.createdBy = filter.createdBy.join(',');
          }
          
          if (filter.tags?.length) {
            params.tags = filter.tags.join(',');
          }
          
          if (filter.searchText) {
            params.keyword = filter.searchText;
          }
        }
        
        const response = await getOpportunityNotes(opportunityId, params);
        
        if (replace) {
          setActivities(response.data);
        } else {
          setActivities(prev => [...prev, ...response.data]);
        }
        
        setTotalPages(response.meta.totalPages);
      } catch (err: any) {
        setError(err.message || 'Không thể tải lịch sử hoạt động');
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [opportunityId, filter, limit]
  );
  
  // Initial load
  useEffect(() => {
    setPage(1);
    fetchActivities(1, true);
  }, [fetchActivities]);
  
  // Load more
  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchActivities(nextPage);
    }
  };
  
  // Toggle expand/collapse of an activity
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id) 
        : [...prev, id]
    );
  };
  
  /**
   * Get appropriate icon for activity based on its type
   * @param {OpportunityNoteResponse} activity - The activity to get icon for
   * @returns {React.ReactNode} The icon component with appropriate styling
   */
  const getActivityIcon = (activity: OpportunityNoteResponse) => {
    // Xác định loại hoạt động từ activity.type (nếu có) hoặc dùng giá trị mặc định
    // Giả sử activity có thêm trường type (cần bổ sung vào OpportunityNoteResponse)
    const type = (activity as any).type || 'internal-note';
    
    // Biểu tượng và màu sắc cho từng loại hoạt động
    const iconsByType: Record<string, { icon: React.ReactNode, bgColor: string }> = {
      'internal-note': {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        bgColor: 'bg-blue-500'
      },
      'call': {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        ),
        bgColor: 'bg-green-500'
      },
      'email': {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        bgColor: 'bg-purple-500'
      },
      'meeting': {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        bgColor: 'bg-amber-500'
      },
      'task': {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        bgColor: 'bg-red-500'
      }
    };
    
    // Lấy biểu tượng và màu sắc cho loại hoạt động
    const { icon, bgColor } = iconsByType[type] || iconsByType['internal-note'];
    
    return (
      <div className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center text-white`}>
        {icon}
      </div>
    );
  };
  
  /**
   * Format date to relative time (e.g., "2 hours ago")
   * @param {string} dateString - ISO date string to format
   * @returns {string} Relative time string in Vietnamese
   */
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: vi 
      });
    } catch (e) {
      return dateString;
    }
  };
  
  /**
   * Format date to display day in a human-readable way
   * @param {string} dateString - ISO date string to format
   * @returns {string} Formatted date (Today, Yesterday, or DD/MM/YYYY)
   */
  const formatDay = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) {
        return 'Hôm nay';
      } else if (isYesterday(date)) {
        return 'Hôm qua';
      } else {
        return format(date, 'dd/MM/yyyy', { locale: vi });
      }
    } catch (e) {
      return '';
    }
  };
  
  /**
   * Group activities by date for better visualization
   * Uses memoization for performance optimization
   * @returns {Array} Array of date groups with items
   */
  const groupedActivities = useMemo(() => {
    const groups: { [key: string]: OpportunityNoteResponse[] } = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    
    // Sort groups by date (newest first)
    return Object.entries(groups)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, items]) => ({
        date,
        formattedDate: formatDay(items[0].createdAt),
        items
      }));
  }, [activities]);
  
  // Loading state
  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }
  
  // Error state
  if (error && !activities.length) {
    return (
      <Alert variant="error" className="my-4">
        {error}
      </Alert>
    );
  }
  
  // Empty state
  if (!activities.length) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center my-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ghi chú nào</h3>
        <p className="text-gray-500">Thêm ghi chú đầu tiên để theo dõi lịch sử tương tác với cơ hội này.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200" style={{ marginLeft: '11px' }}></div>
        
        {/* Activities grouped by date */}
        <div className="space-y-8">
          {groupedActivities.map((group) => (
            <div key={group.date} className="space-y-6">
              {/* Date header */}
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">{group.formattedDate}</span>
              </div>
              
              {/* Activities for this date */}
              {group.items.map((activity) => (
                <div key={activity.id} className="relative pl-10">
                  {/* Icon */}
                  <div className="absolute left-0 top-0 mt-1.5">
                    {getActivityIcon(activity)}
                  </div>
                  
                  {/* Content */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{activity.createdBy.name}</span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{formatDate(activity.createdAt)}</span>
                        </div>
                        
                        {/* Tags would go here if they were part of the API response */}
                        {/* {activity.tags && activity.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activity.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )} */}
                      </div>
                      
                      <button
                        onClick={() => toggleExpand(activity.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 transform transition-transform ${expandedIds.includes(activity.id) ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Content - always show first 3 lines, expand for more */}
                    <div 
                      className={`overflow-hidden transition-all duration-200 ${
                        expandedIds.includes(activity.id) 
                          ? 'max-h-none' 
                          : 'max-h-24'
                      }`}
                    >
                      <div
                        className="text-gray-700 whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: activity.content }}
                      />
                    </div>
                    
                    {/* Expand/collapse button for long content */}
                    {activity.content.length > 200 && !expandedIds.includes(activity.id) && (
                      <button
                        onClick={() => toggleExpand(activity.id)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Xem thêm
                      </button>
                    )}
                    
                    {/* Attachments */}
                    {activity.attachments && activity.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Tệp đính kèm:</p>
                        <div className="flex flex-wrap gap-2">
                          {activity.attachments.map(attachment => (
                            <a
                              key={attachment.id}
                              href={attachment.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm hover:bg-gray-200 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {attachment.fileName}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Load more button */}
      {page < totalPages && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
          >
            {loadingMore ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Đang tải...
              </>
            ) : (
              'Tải thêm'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline; 