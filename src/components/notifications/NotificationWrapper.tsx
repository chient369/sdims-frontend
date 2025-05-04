import React from 'react';
import { ToastContainer } from './ToastContainer';

/**
 * Wrapper component that includes all global notification UI elements
 */
const NotificationWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer position="top-right" />
    </>
  );
};

export default NotificationWrapper; 