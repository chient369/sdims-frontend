import React, { useState } from 'react';

interface HeaderProps {
  toggleSidebar: () => void;
}

/**
 * Header component for main layout with user menu and notifications
 * 
 * @param {Function} toggleSidebar - Function to toggle sidebar visibility
 * @returns {JSX.Element} The rendered header component
 */
const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Mock data - in a real app, this would come from user context/state
  const user = {
    name: 'Nguyen Van A',
    email: 'nguyenvana@example.com',
    role: 'Developer',
    avatar: null // Placeholder for user avatar
  };
  
  // Mock notifications - in a real app, this would come from API/context
  const notifications = [
    { id: 1, text: 'New opportunity assigned to you', time: '5 minutes ago', unread: true },
    { id: 2, text: 'Contract #123 needs review', time: '1 hour ago', unread: true },
    { id: 3, text: 'Team meeting in 30 minutes', time: '2 hours ago', unread: false },
  ];
  
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-secondary-200 bg-white px-4 shadow-sm z-30 w-full sticky top-0">
      {/* Mobile menu button */}
      <div className="md:hidden">
        <button 
          onClick={toggleSidebar}
          className="text-secondary-500 hover:text-secondary-700 focus:outline-none"
          aria-label="Open sidebar"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Left side - app title or breadcrumb would go here */}
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold text-secondary-800">SDIMS</h1>
      </div>
      
      {/* Right side - notifications and user menu */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-1 text-secondary-500 hover:text-secondary-700 focus:outline-none"
            aria-label={`${unreadCount} unread notifications`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-secondary-200">
              <div className="px-4 py-2 border-b border-secondary-200">
                <h3 className="text-sm font-semibold text-secondary-700">Notifications</h3>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div>
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-2 hover:bg-secondary-50 ${notification.unread ? 'bg-blue-50' : ''}`}
                      >
                        <p className="text-sm text-secondary-800">{notification.text}</p>
                        <p className="text-xs text-secondary-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-secondary-500">
                    <p>No notifications</p>
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-secondary-200 text-center">
                  <button className="text-xs text-primary-600 hover:text-primary-800">
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* User menu */}
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 focus:outline-none"
            aria-label="Open user menu"
          >
            <span className="hidden md:block text-sm text-secondary-700">{user.name}</span>
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0)}
              </div>
            )}
          </button>
          
          {/* User dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-secondary-200">
              <div className="px-4 py-2 border-b border-secondary-200">
                <p className="text-sm font-semibold text-secondary-800">{user.name}</p>
                <p className="text-xs text-secondary-500">{user.email}</p>
                <p className="text-xs text-secondary-500 mt-1">{user.role}</p>
              </div>
              
              <a href="/profile" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                Profile
              </a>
              <a href="/settings" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50">
                Settings
              </a>
              <a href="/logout" className="block px-4 py-2 text-sm text-red-600 hover:bg-secondary-50 border-t border-secondary-200">
                Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 