import React from 'react';
import { reportService } from '../service';

const PaymentReport: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Payment Report</h1>
      <p className="text-gray-600 mb-8">Track payment status, invoices, and financial status for all contracts.</p>
      
      {/* Report content will be implemented here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Payment report implementation coming soon</p>
      </div>
    </div>
  );
};

export default PaymentReport; 