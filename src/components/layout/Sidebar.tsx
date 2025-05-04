import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * Sidebar component for main layout with collapsible functionality
 * 
 * @param {boolean} collapsed - Whether the sidebar is collapsed
 * @param {Function} onToggle - Function to toggle sidebar collapsed state
 * @returns {JSX.Element} The rendered sidebar component
 */
const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  // For a real app, you would get these from an authentication/authorization context
  const userPermissions = ['dashboard.access', 'hrm.access', 'margins.access', 'contracts.access', 'opportunities.access'];

  const menuItems = [
    { name: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/dashboard', permission: 'dashboard.access' },
    { name: 'Human Resources', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', path: '/hrm', permission: 'hrm.access' },
    { name: 'Margin Management', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', path: '/margins', permission: 'margins.access' },
    { name: 'Contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', path: '/contracts', permission: 'contracts.access' },
    { name: 'Opportunities', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z', path: '/opportunities', permission: 'opportunities.access' },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    userPermissions.includes(item.permission)
  );

  return (
    <div 
      className={`${collapsed ? 'w-20' : 'w-64'} h-screen flex-shrink-0 flex flex-col bg-secondary-800 transition-all duration-300 fixed md:relative z-30`}
    >
      {/* Logo and Title */}
      <div className="flex h-16 items-center justify-center bg-secondary-900">
        <h1 className={`font-bold text-white ${collapsed ? 'text-xl' : 'text-xl'}`}>
          {collapsed ? 'SD' : 'SDIMS'}
        </h1>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-secondary-800 rounded-full p-1 border border-secondary-700 text-secondary-300 hover:text-white focus:outline-none"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {collapsed ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          )}
        </svg>
      </button>

      {/* Menu Items */}
      <div className="flex flex-grow flex-col overflow-y-auto py-4">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              ${isActive ? 'bg-secondary-700 text-white' : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'}
              ${collapsed ? 'py-3 mx-3 px-0' : 'py-2 mx-3 px-3'} 
              rounded-md mb-1 flex items-center transition-colors duration-200
            `}
          >
            <svg 
              className={`${collapsed ? 'mx-auto' : 'mr-3'} h-6 w-6`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
            </svg>
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className={`p-4 border-t border-secondary-700 ${collapsed ? 'text-center' : ''}`}>
        <div className="text-xs text-secondary-500">
          {!collapsed && <p>Version 1.0.0</p>}
          {!collapsed && <p className="mt-1">© 2023 SDIMS</p>}
          {collapsed && <p>v1.0</p>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 