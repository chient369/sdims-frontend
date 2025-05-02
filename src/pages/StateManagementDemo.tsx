import React, { useState } from 'react';
import { useAuth, useUI, useNotifications } from '../store';
import { useNotificationContext } from '../context/NotificationContext';
import { useEmployees } from '../hooks/useEmployees';
import PermissionGuard from '../components/ui/PermissionGuard';

const StateManagementDemo: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Zustand store hooks
  const auth = useAuth();
  const ui = useUI();
  const notifications = useNotifications();
  
  // Context API hooks
  const notificationContext = useNotificationContext();
  
  // React Query hooks
  const { data: employeesData, isLoading, error } = useEmployees();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.login(username, password);
      notifications.addNotification({
        type: 'success',
        title: 'Success',
        message: 'Logged in successfully!',
      });
    } catch (error) {
      notifications.addNotification({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };
  
  const handleToggleTheme = () => {
    ui.toggleTheme();
    notificationContext.addNotification({
      type: 'info',
      message: `Theme switched to ${ui.theme === 'light' ? 'dark' : 'light'} mode`,
    });
  };
  
  // Add permission examples section
  const renderPermissionExamples = () => {
    if (!auth.isAuthenticated) {
      return (
        <div className="p-4 bg-gray-100 rounded">
          <p>Please log in to see permission examples</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Your Permissions:</h3>
          <ul className="list-disc pl-5">
            {auth.user?.permissions.map((perm, index) => (
              <li key={index}>{perm}</li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-3 rounded">
            <h3 className="font-semibold mb-2">Single Permission Check:</h3>
            <div className="space-y-2">
              <div>
                <code>admin</code>:
                <span className="ml-2 px-2 py-1 rounded text-sm text-white bg-blue-500">
                  {auth.hasPermission('admin') ? 'Granted' : 'Denied'}
                </span>
              </div>
              <div>
                <code>user.read</code>:
                <span className="ml-2 px-2 py-1 rounded text-sm text-white bg-blue-500">
                  {auth.hasPermission('user.read') ? 'Granted' : 'Denied'}
                </span>
              </div>
              <div>
                <code>employee:read:team</code>:
                <span className="ml-2 px-2 py-1 rounded text-sm text-white bg-blue-500">
                  {auth.hasPermission('employee:read:team') ? 'Granted' : 'Denied'}
                </span>
              </div>
              <div>
                <code>employee:read:own</code>:
                <span className="ml-2 px-2 py-1 rounded text-sm text-white bg-blue-500">
                  {auth.hasPermission('employee:read:own') ? 'Granted' : 'Denied'}
                </span>
              </div>
            </div>
          </div>

          <div className="border p-3 rounded">
            <h3 className="font-semibold mb-2">Multiple Permission Checks:</h3>
            <div className="space-y-2">
              <div>
                <code>hasAnyPermission(['admin', 'user.read'])</code>:
                <span className="ml-2 px-2 py-1 rounded text-sm text-white bg-blue-500">
                  {auth.hasAnyPermission(['admin', 'user.read']) ? 'Granted' : 'Denied'}
                </span>
              </div>
              <div>
                <code>hasAllPermissions(['admin', 'user.read'])</code>:
                <span className="ml-2 px-2 py-1 rounded text-sm text-white bg-blue-500">
                  {auth.hasAllPermissions(['admin', 'user.read']) ? 'Granted' : 'Denied'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border p-3 rounded">
          <h3 className="font-semibold mb-2">UI Permission Guards:</h3>
          <div className="space-y-4">
            <PermissionGuard
              permission="admin"
              fallback={<div className="p-2 bg-red-100 rounded">You need 'admin' permission to see this content</div>}
            >
              <div className="p-2 bg-green-100 rounded">
                This content is only visible to users with 'admin' permission
              </div>
            </PermissionGuard>

            <PermissionGuard
              permission="user.read"
              fallback={<div className="p-2 bg-red-100 rounded">You need 'user.read' permission to see this content</div>}
            >
              <div className="p-2 bg-green-100 rounded">
                This content is only visible to users with 'user.read' permission
              </div>
            </PermissionGuard>

            <PermissionGuard
              anyPermissions={['admin', 'hrm.read']}
              fallback={<div className="p-2 bg-red-100 rounded">You need either 'admin' or 'hrm.read' permission</div>}
            >
              <div className="p-2 bg-green-100 rounded">
                This content is visible to users with either 'admin' OR 'hrm.read' permission
              </div>
            </PermissionGuard>

            <PermissionGuard
              allPermissions={['user.read', 'hrm.read']}
              fallback={<div className="p-2 bg-red-100 rounded">You need both 'user.read' AND 'hrm.read' permissions</div>}
            >
              <div className="p-2 bg-green-100 rounded">
                This content is only visible to users with BOTH 'user.read' AND 'hrm.read' permissions
              </div>
            </PermissionGuard>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">State Management Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth State */}
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Authentication (Zustand)</h2>
          
          {auth.isAuthenticated ? (
            <div>
              <p className="mb-2">Logged in as: <strong>{auth.user?.fullName}</strong></p>
              <p className="mb-4">Role: {auth.user?.role}</p>
              <button 
                onClick={auth.logout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block mb-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Try 'admin'"
                />
              </div>
              <div>
                <label className="block mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Try 'password'"
                />
              </div>
              <button 
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={auth.isLoading}
              >
                {auth.isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}
        </div>
        
        {/* UI State */}
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">UI Settings (Zustand)</h2>
          
          <div className="space-y-4">
            <div>
              <p className="mb-2">Current Theme: <strong>{ui.theme}</strong></p>
              <button 
                onClick={handleToggleTheme}
                className="bg-purple-500 text-white px-4 py-2 rounded"
              >
                Toggle Theme
              </button>
            </div>
            
            <div>
              <p className="mb-2">Sidebar State: <strong>{ui.sidebarState}</strong></p>
              <button 
                onClick={ui.toggleSidebar}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Toggle Sidebar
              </button>
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <button 
              onClick={() => notifications.addNotification({
                type: 'info',
                title: 'Zustand Notification',
                message: 'This notification was created with Zustand',
              })}
              className="bg-blue-500 text-white px-4 py-2 rounded block w-full"
            >
              Add Zustand Notification
            </button>
            
            <button 
              onClick={() => notificationContext.addNotification({
                type: 'success',
                title: 'Context API Notification',
                message: 'This notification was created with Context API',
              })}
              className="bg-green-500 text-white px-4 py-2 rounded block w-full"
            >
              Add Context API Notification
            </button>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold">Zustand Notifications:</h3>
            {notifications.notifications.length === 0 ? (
              <p className="text-gray-500">No notifications</p>
            ) : (
              <ul className="space-y-2 mt-2">
                {notifications.notifications.map(notification => (
                  <li 
                    key={notification.id}
                    className={`p-2 rounded ${
                      notification.type === 'error' ? 'bg-red-100' :
                      notification.type === 'success' ? 'bg-green-100' :
                      notification.type === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}
                  >
                    {notification.title && <strong>{notification.title}: </strong>}
                    {notification.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold">Context API Notifications:</h3>
            {notificationContext.notifications.length === 0 ? (
              <p className="text-gray-500">No notifications</p>
            ) : (
              <ul className="space-y-2 mt-2">
                {notificationContext.notifications.map(notification => (
                  <li 
                    key={notification.id}
                    className={`p-2 rounded ${
                      notification.type === 'error' ? 'bg-red-100' :
                      notification.type === 'success' ? 'bg-green-100' :
                      notification.type === 'warning' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}
                  >
                    {notification.title && <strong>{notification.title}: </strong>}
                    {notification.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* React Query */}
        <div className="border p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Employee Data (React Query)</h2>
          
          {isLoading ? (
            <p>Loading employees...</p>
          ) : error ? (
            <p className="text-red-500">Error loading employees</p>
          ) : (
            <>
              <p className="mb-2">Total employees: {employeesData?.pageable.totalElements}</p>
              <ul className="space-y-2 mt-2">
                {employeesData?.content.map(employee => (
                  <li key={employee.id} className="p-2 border rounded">
                    <div className="flex items-center">
                      {employee.avatar && (
                        <img 
                          src={employee.avatar} 
                          alt={`${employee.name}`}
                          className="w-10 h-10 rounded-full mr-4"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        
        {/* Add Permission System section */}
        <div className="border p-4 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Permission System</h2>
          {renderPermissionExamples()}
        </div>
      </div>
    </div>
  );
};

export default StateManagementDemo; 