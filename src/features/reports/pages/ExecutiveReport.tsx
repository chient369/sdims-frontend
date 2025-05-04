import React, { useEffect, useState } from 'react';
import { reportService } from '../service';

const ExecutiveReport: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  useEffect(() => {
    loadExecutiveReport();
  }, []);
  
  const loadExecutiveReport = async () => {
    try {
      setIsLoading(true);
      
      // Get the last 6 months
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      
      const fromDate = sixMonthsAgo.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];
      
      const data = await reportService.getExecutiveSummary(fromDate, toDate);
      setReportData(data);
    } catch (error) {
      console.error('Error loading executive report:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Executive Dashboard</h1>
      <p className="text-gray-600 mb-8">Comprehensive high-level business overview for executives and management.</p>
      
      {/* Report content will be implemented here */}
      <div className="bg-white p-6 rounded-lg shadow">
        <p>Executive dashboard implementation coming soon</p>
      </div>
    </div>
  );
};

export default ExecutiveReport; 