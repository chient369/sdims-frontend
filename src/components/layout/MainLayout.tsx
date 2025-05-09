import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import Footer from './Footer';
import ErrorBoundary from '../ui/ErrorBoundary';

interface MainLayoutProps {
  children?: React.ReactNode;
}

/**
 * MainLayout component that provides the main application layout structure
 * with responsive sidebar, header, breadcrumb navigation, and footer
 * 
 * @returns {JSX.Element} The rendered layout with children content
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // State for sidebar collapse/expand functionality
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // State for mobile sidebar visibility
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Toggle mobile sidebar visibility
  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };
  
  // Close mobile sidebar when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileSidebarOpen]);
  
  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Desktop Sidebar */}
      <div className={`hidden md:block ${mobileSidebarOpen ? 'hidden' : ''}`}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={toggleSidebar} 
        />
      </div>
      
      {/* Mobile Sidebar - visible only on mobile when opened */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-secondary-900 bg-opacity-50 transition-opacity" 
            onClick={toggleMobileSidebar}
          ></div>
          
          {/* Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-secondary-800">
            <Sidebar 
              collapsed={false} 
              onToggle={() => {}} // No toggle on mobile
            />
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 overflow-hidden ${sidebarCollapsed ? 'md:ml-0' : 'md:ml-0'}`}>
        {/* Header */}
        <Header toggleSidebar={toggleMobileSidebar} />
        
        {/* Main content with ErrorBoundary */}
        <ErrorBoundary>
          <div className="flex flex-col flex-1 overflow-auto">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Page Content */}
            <main className="flex-1 p-4">
              <div className="w-full">
                {children || <Outlet />}
              </div>
            </main>
            
            {/* Footer */}
            <Footer />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default MainLayout; 