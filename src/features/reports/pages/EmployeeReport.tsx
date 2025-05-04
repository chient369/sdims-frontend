import React, { useState } from 'react';
import { reportService } from '../service';
import { EmployeeReportParams } from '../types';

const EmployeeReport: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGenerateReport = async (params: EmployeeReportParams) => {
    try {
      setIsLoading(true);
      const report = await reportService.getEmployeeReport(params);
      // Process report data
    } catch (error) {
      console.error('Error generating employee report:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Employee Report</h1>
      <p className="text-gray-600 mb-8">View and export detailed employee information, skills, project assignments, and utilization rates.</p>
      
      {/* Report content will be implemented here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Employee report implementation coming soon</p>
      </div>
    </div>
  );
};

export default EmployeeReport; 