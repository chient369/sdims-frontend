import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getOpportunityNotes } from '../../api';
import { OpportunityNoteResponse } from '../../types';
import { Spinner, Alert, Button } from '../../../../components/ui';

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
  notes?: OpportunityNoteResponse[];
  isLoading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

/**
 * ActivityTimeline component displays a timeline of notes and activities
 * for an opportunity
 * @param {string} opportunityId - ID of the opportunity to get activities for
 * @param {Object} filter - Optional filters to apply
 * @param {number} limit - Number of activities to fetch per page
 * @param {OpportunityNoteResponse[]} notes - Notes to display (if provided directly)
 * @param {boolean} isLoading - Whether notes are being loaded
 * @param {string|null} error - Error message if any
 * @param {boolean} hasMore - Whether there are more notes to load
 * @param {Function} onLoadMore - Callback to load more notes
 * @returns {JSX.Element} The rendered component
 */
const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  opportunityId,
  filter,
  limit = 10,
  notes = [],
  isLoading = false,
  error = null,
  hasMore = false,
  onLoadMore
}) => {
  // State
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  
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
    const type = activity.activityType || (activity as any).type || 'note';
    
    // Biểu tượng và màu sắc cho từng loại hoạt động
    const iconsByType: Record<string, { icon: React.ReactNode, bgColor: string }> = {
      'note': {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        bgColor: 'bg-blue-500'
      },
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
    const { icon, bgColor } = iconsByType[type] || iconsByType['note'];
    
    return (
      <div className={`h-8 w-8 rounded-full ${bgColor} flex items-center justify-center text-white`}>
        {icon}
      </div>
    );
  };
  
  /**
   * Format date to display relative to now in a human-readable way
   * @param {string} dateString - ISO date string to format
   * @returns {string} Formatted date relative to now
   */
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi
      });
    } catch (e) {
      return '';
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
    
    notes.forEach(activity => {
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
  }, [notes]);
  
  // Loading state
  if (isLoading && notes.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }
  
  // Error state
  if (error && notes.length === 0) {
    return (
      <Alert variant="error" className="my-4">
        {error}
      </Alert>
    );
  }
  
  // Empty state
  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có ghi chú hoặc hoạt động nào được ghi lại
      </div>
    );
  }
  
  return (
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
            <div className="space-y-4">
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
                          <span className="font-medium">
                            {activity.createdBy ? activity.createdBy.name : (activity.authorName || 'Unknown User')}
                          </span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{formatDate(activity.createdAt)}</span>
                          
                          {/* Hiển thị activityType nếu có */}
                          {activity.activityType && (
                            <>
                              <span className="mx-2 text-gray-500">•</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                activity.activityType === 'note' ? 'bg-blue-100 text-blue-800' :
                                activity.activityType === 'call' ? 'bg-green-100 text-green-800' :
                                activity.activityType === 'email' ? 'bg-purple-100 text-purple-800' :
                                activity.activityType === 'meeting' ? 'bg-amber-100 text-amber-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.activityType === 'note' ? 'Ghi chú' :
                                 activity.activityType === 'call' ? 'Cuộc gọi' :
                                 activity.activityType === 'email' ? 'Email' :
                                 activity.activityType === 'meeting' ? 'Cuộc họp' :
                                 activity.activityType}
                              </span>
                            </>
                          )}

                          {/* Hiển thị tags nếu có */}
                          {activity.tags && activity.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {activity.tags.map((tag, tagIndex) => (
                                <span 
                                  key={tagIndex}
                                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
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
                    
                    {/* Attachments */}
                    {activity.attachments && activity.attachments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Tài liệu đính kèm:</p>
                        <div className="flex flex-wrap gap-2">
                          {activity.attachments.map((file) => (
                            <a
                              key={file.id}
                              href={file.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 text-sm"
                            >
                              {/* File icon */}
                              <span className="mr-2 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </span>
                              <span className="truncate max-w-[150px]">{file.fileName}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Load more */}
      {hasMore && (
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onLoadMore}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Tải thêm
          </Button>
        </div>
      )}
      
      {/* Loading indicator for load more */}
      {isLoading && notes.length > 0 && !onLoadMore && (
        <div className="flex justify-center items-center py-4">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline; 