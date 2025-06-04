import React, { useState } from 'react';

/**
 * System Configuration component for managing system-wide settings
 * @returns {JSX.Element} The rendered component
 */
const SystemConfig: React.FC = () => {
  // Mock configuration data
  const [config, setConfig] = useState({
    general: {
      siteName: 'SDMS - System Development Management Service',
      siteDescription: 'Management platform for system development projects',
      maintenanceMode: false,
      defaultLanguage: 'en',
      timezone: 'UTC+7',
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      passwordExpiryDays: 90,
      requireStrongPasswords: true,
      twoFactorAuth: false,
    },
    email: {
      smtpServer: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'notifications@example.com',
      smtpEncryption: 'TLS',
      senderName: 'SDMS Notifications',
      senderEmail: 'notifications@example.com',
    },
    notifications: {
      emailNotifications: true,
      systemNotifications: true,
      alertsFrequency: 'immediate',
    }
  });
  
  // Track form changes
  const [hasChanges, setHasChanges] = useState(false);
  
  // Handle form input changes
  const handleChange = (
    section: keyof typeof config, 
    setting: string, 
    value: string | number | boolean
  ) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [section]: {
        ...prevConfig[section as keyof typeof prevConfig],
        [setting]: value
      }
    }));
    setHasChanges(true);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send the configuration to an API
    console.log('Saving configuration:', config);
    
    // Reset changes flag
    setHasChanges(false);
    
    // Show success message
    alert('Configuration saved successfully!');
  };
  
  // Helper function to render different input types based on value type
  const renderConfigInput = (
    section: keyof typeof config, 
    settingKey: string, 
    value: any, 
    label: string
  ) => {
    switch (typeof value) {
      case 'boolean':
        return (
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleChange(section, settingKey, e.target.checked)}
                className="w-4 h-4 mr-3"
              />
              <span className="font-medium">{label}</span>
            </label>
          </div>
        );
      case 'number':
        return (
          <div className="mb-4">
            <label className="block mb-2 font-medium">{label}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(section, settingKey, parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        );
      default:
        return (
          <div className="mb-4">
            <label className="block mb-2 font-medium">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(section, settingKey, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        );
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Configuration</h1>
        {hasChanges && (
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Save Changes
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold">General Settings</h2>
            </div>
            <div className="p-6">
              {Object.entries(config.general).map(([key, value]) => {
                // Convert camelCase to Title Case for labels
                const label = key.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                
                return renderConfigInput('general', key, value, label);
              })}
            </div>
          </div>
          
          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold">Security Settings</h2>
            </div>
            <div className="p-6">
              {Object.entries(config.security).map(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                
                return renderConfigInput('security', key, value, label);
              })}
            </div>
          </div>
          
          {/* Email Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold">Email Settings</h2>
            </div>
            <div className="p-6">
              {Object.entries(config.email).map(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                
                return renderConfigInput('email', key, value, label);
              })}
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold">Notification Settings</h2>
            </div>
            <div className="p-6">
              {Object.entries(config.notifications).map(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
                
                return renderConfigInput('notifications', key, value, label);
              })}
            </div>
          </div>
        </div>
        
        {hasChanges && (
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Save All Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SystemConfig; 