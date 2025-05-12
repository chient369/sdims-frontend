import React from 'react';

export type TabType = 'all' | 'favorites' | 'recent';

interface ReportTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    all: number;
    favorites: number;
    recent: number;
  };
}

/**
 * Component for report list view tabs 
 * @param {ReportTabsProps} props - Component props
 * @returns {JSX.Element} - The rendered component
 */
const ReportTabs: React.FC<ReportTabsProps> = ({ activeTab, onTabChange, counts }) => {
  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'all', label: 'Tất cả', count: counts.all },
    { id: 'favorites', label: 'Yêu thích', count: counts.favorites },
    { id: 'recent', label: 'Đã xem gần đây', count: counts.recent }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-secondary-100 text-secondary-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ReportTabs; 