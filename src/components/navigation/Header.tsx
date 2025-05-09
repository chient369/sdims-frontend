import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Transition } from '@headlessui/react';
import { 
  HiOutlineBell, 
  HiOutlineSearch,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCog
} from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface HeaderProps {
  showSearchBar?: boolean;
}

/**
 * Header component with user profile and notifications
 * @param {HeaderProps} props - Component props
 * @returns {JSX.Element} The rendered Header component
 */
const Header: React.FC<HeaderProps> = ({ showSearchBar = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Dummy notifications for demo
  const notifications = [
    { id: 1, title: 'New employee added', time: '30 min ago', read: false },
    { id: 2, title: 'Meeting reminder', time: '1 hour ago', read: false },
    { id: 3, title: 'Task completed', time: '2 hours ago', read: true },
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get user display name for the avatar
  const getUserInitial = (): string => {
    if (!user) return '';
    
    // Try different properties that might contain the name
    if (user.fullName) return user.fullName.charAt(0);
    if (user.firstName) return user.firstName.charAt(0);
    if (user.username) return user.username.charAt(0);
    if (user.email) return user.email.charAt(0);
    
    return '';
  };

  // Get user display name
  const getUserDisplayName = (): string => {
    if (!user) return '';
    
    if (user.fullName) return user.fullName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    
    return 'User';
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Navigating to logout page');
    navigate('/logout');
  };

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <header className="h-16 px-4 flex items-center justify-between bg-white border-b z-10">
      {/* Left side */}
      <div className="flex items-center">
        {showSearchBar && (
          <div className="relative max-w-xs hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiOutlineSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search..."
            />
          </div>
        )}
      </div>
      
      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            className="relative p-2 text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={(e) => {
              e.stopPropagation();
              setNotificationsOpen(!notificationsOpen);
            }}
          >
            <HiOutlineBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications dropdown */}
          <Transition
            show={notificationsOpen}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="px-4 py-3 border-b">
                <h3 className="text-sm font-medium">Notifications</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "px-4 py-3 hover:bg-gray-50 cursor-pointer",
                        !notification.read && "bg-primary-50"
                      )}
                    >
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    No notifications
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t">
                <Link to="/notifications" className="text-xs text-primary-600 hover:text-primary-800">
                  View all notifications
                </Link>
              </div>
            </div>
          </Transition>
        </div>
        
        {/* User menu */}
        <Menu as="div" className="relative" ref={userMenuRef}>
          <Menu.Button className="flex items-center space-x-3 focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {user && 'avatar' in user ? (
                <img src={(user as any).avatar} alt={getUserDisplayName()} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-700 font-medium">{getUserInitial()}</span>
              )}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900">{getUserDisplayName()}</div>
              <div className="text-xs text-gray-500">{user?.role || 'User'}</div>
            </div>
          </Menu.Button>
          
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-50">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className={cn(
                      "flex items-center px-4 py-2 text-sm text-gray-700",
                      active && "bg-gray-100"
                    )}
                  >
                    <HiOutlineUser className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Your Profile
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/settings"
                    className={cn(
                      "flex items-center px-4 py-2 text-sm text-gray-700",
                      active && "bg-gray-100"
                    )}
                  >
                    <HiOutlineCog className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Settings
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={cn(
                      "flex items-center px-4 py-2 text-sm text-gray-700 w-full text-left",
                      active && "bg-gray-100"
                    )}
                  >
                    <HiOutlineLogout className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};

export default Header; 