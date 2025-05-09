/**
 * Tab component for navigation between different sections of content.
 * Supports responsive design and active tab indication.
 */

import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  /**
   * Array of tab items with id, label, and content
   */
  items: TabItem[];
  /**
   * Optional default active tab ID
   */
  defaultActiveTab?: string;
  /**
   * Optional CSS class for the container
   */
  className?: string;
  /**
   * Optional callback when active tab changes
   */
  onChange?: (tabId: string) => void;
}

/**
 * Tabs component that allows switching between different content sections
 * 
 * @param {TabsProps} props - Component props
 * @returns {JSX.Element} The rendered tabs component
 */
const Tabs: React.FC<TabsProps> = ({ items, defaultActiveTab, className = '', onChange }) => {
  // Use the first tab as default active tab if none provided
  const [activeTab, setActiveTab] = useState<string>(defaultActiveTab || (items.length > 0 ? items[0].id : ''));

  // Find the active tab content
  const activeTabContent = items.find(item => item.id === activeTab)?.content;

  // Handle tab click
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {items.map(tab => (
            <button
              key={tab.id}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}
                whitespace-nowrap focus:outline-none
              `}
              onClick={() => handleTabClick(tab.id)}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTabContent}
      </div>
    </div>
  );
};

export default Tabs; 