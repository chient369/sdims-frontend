import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Alert } from '../notifications/Alert';
import { Button } from '../ui/Button';

/**
 * Example component showing how to use the notification system
 */
const NotificationExample: React.FC = () => {
  const { showToast, addNotification } = useNotifications();

  const handleSuccessClick = () => {
    showToast('success', 'Success!', 'Your changes have been saved successfully.');
  };

  const handleErrorClick = () => {
    showToast('error', 'Error!', 'Something went wrong. Please try again.', { duration: 8000 });
  };

  const handleWarningClick = () => {
    showToast('warning', 'Warning!', 'This action may have consequences.');
  };

  const handleInfoClick = () => {
    showToast('info', 'Information', 'Your session will expire in 10 minutes.');
  };

  const handleAddNotification = () => {
    addNotification('info', 'New message', 'You have received a new message from Admin.');
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-lg font-medium">Notification Examples</h2>

      <div className="space-y-4">
        <h3 className="text-md font-medium">Toast Notifications</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSuccessClick}>Show Success Toast</Button>
          <Button onClick={handleErrorClick}>Show Error Toast</Button>
          <Button onClick={handleWarningClick}>Show Warning Toast</Button>
          <Button onClick={handleInfoClick}>Show Info Toast</Button>
          <Button onClick={handleAddNotification}>Add to Notification Center</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-md font-medium">Alert Components</h3>
        <div className="space-y-4">
          <Alert
            type="success"
            title="Success Alert"
            message="Your profile has been updated successfully."
            dismissible
          />
          <Alert
            type="error"
            title="Error Alert"
            message="There was a problem with your request."
            dismissible
          />
          <Alert
            type="warning"
            title="Warning Alert"
            message="Your account is about to expire."
            action={<Button size="sm">Renew Now</Button>}
            dismissible
          />
          <Alert
            type="info"
            message="Scheduled maintenance will occur this weekend."
            dismissible
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationExample; 