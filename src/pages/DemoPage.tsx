import React, { useState } from 'react';
import { Sidebar, Header, Breadcrumbs } from '../components/navigation';

/**
 * Demo page showing the navigation components in action
 * @returns {JSX.Element} The rendered DemoPage component
 */
const DemoPage: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header showSearchBar={true} />
        
        <Breadcrumbs 
          overrides={{
            '/dashboard': 'Dashboard Home'
          }} 
        />
        
        <main className="p-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Navigation Components Demo</h1>
            <p className="text-gray-700 mb-4">
              This page demonstrates the navigation components in action:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><strong>Sidebar:</strong> Collapsible menu with nested items and permission handling</li>
              <li><strong>Header:</strong> User profile dropdown and notifications</li>
              <li><strong>Breadcrumbs:</strong> Dynamic breadcrumbs based on the current route</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoPage; 