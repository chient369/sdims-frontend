import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { menuItems, MenuItem } from '../../config/menuItems';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { Logo } from '../ui';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * Sidebar navigation component with collapsible menu groups
 * @param {SidebarProps} props - Component props
 * @returns {JSX.Element} The rendered Sidebar component
 */
const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { hasPermission } = useAuth();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const renderMenuItem = (item: MenuItem) => {
    // Check permission first
    if (item.permission && !hasPermission(item.permission)) {
      return null;
    }
    
    const active = isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.includes(item.id);
    
    return (
      <div key={item.id} className="mb-1">
        <div
          className={cn(
            "flex items-center px-4 py-2 rounded-md cursor-pointer transition-colors",
            active ? "bg-primary-100 text-primary-800" : "hover:bg-gray-100",
            collapsed && "justify-center"
          )}
          onClick={() => hasChildren ? toggleGroup(item.id) : null}
        >
          <Link 
            to={hasChildren ? "#" : item.path}
            className="flex items-center w-full" 
            onClick={(e) => hasChildren && e.preventDefault()}
          >
            <item.icon className={cn("w-5 h-5", active ? "text-primary-600" : "text-gray-500")} />
            
            {!collapsed && (
              <span className="ml-3 text-sm font-medium">{item.title}</span>
            )}
            
            {!collapsed && item.badge && (
              <span className={`ml-auto px-2 py-0.5 text-xs rounded-full bg-${item.badge.color}-100 text-${item.badge.color}-800`}>
                {item.badge.text}
              </span>
            )}
            
            {!collapsed && hasChildren && (
              <span className="ml-auto">
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            )}
          </Link>
        </div>
        
        {/* Children items */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="pl-10 mt-1">
            {item.children!.map(child => {
              if (child.permission && !hasPermission(child.permission)) {
                return null;
              }
              
              const childActive = isActive(child.path);
              
              return (
                <Link
                  key={child.id}
                  to={child.path}
                  className={cn(
                    "flex items-center px-2 py-1.5 mb-1 text-sm rounded-md",
                    childActive ? "bg-primary-50 text-primary-700" : "hover:bg-gray-50"
                  )}
                >
                  <child.icon className={cn("w-4 h-4", childActive ? "text-primary-600" : "text-gray-500")} />
                  <span className="ml-2">{child.title}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <aside 
      className={cn(
        "h-screen fixed left-0 top-0 z-20 flex flex-col transition-all duration-300 bg-white border-r",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo area */}
      <div className={cn(
        "h-16 flex items-center px-4 border-b",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {collapsed ? (
          <Logo type="icon" className="w-8 h-8" />
        ) : (
          <Logo type="full" className="h-8" />
        )}
        
        {!collapsed && (
          <button 
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Collapsed toggle button */}
      {collapsed && (
        <button 
          onClick={onToggle}
          className="absolute top-16 -right-3 p-1 bg-white rounded-full border shadow-sm"
        >
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      
      {/* Menu items */}
      <div className="flex-1 px-2 py-4 overflow-y-auto">
        {menuItems.map(renderMenuItem)}
      </div>
      
      {/* Footer */}
      <div className={cn(
        "border-t px-4 py-3 text-xs text-gray-500",
        collapsed ? "text-center" : ""
      )}>
        {!collapsed && <div>SDIMS v1.0.0</div>}
      </div>
    </aside>
  );
};

export default Sidebar; 