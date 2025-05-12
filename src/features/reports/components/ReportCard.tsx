import React from 'react';
import { Report, ReportModule } from '../types';

// Module icons mapping
const MODULE_ICONS: Record<ReportModule, React.ReactNode> = {
  hrm: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  margin: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  opportunity: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  contract: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  finance: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  admin: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
};

// Module color mapping
const MODULE_COLORS: Record<ReportModule, string> = {
  hrm: 'bg-blue-100 text-blue-600',
  margin: 'bg-emerald-100 text-emerald-600',
  opportunity: 'bg-amber-100 text-amber-600',
  contract: 'bg-indigo-100 text-indigo-600',
  finance: 'bg-rose-100 text-rose-600',
  dashboard: 'bg-purple-100 text-purple-600',
  admin: 'bg-slate-100 text-slate-600'
};

interface ReportCardProps {
  report: Report;
  onOpen: (report: Report) => void;
}

/**
 * Component for displaying a report card in the reports list
 * @param {ReportCardProps} props - Component props
 * @returns {JSX.Element} - The rendered component
 */
const ReportCard: React.FC<ReportCardProps> = ({ report, onOpen }) => {
  const handleOpen = () => {
    onOpen(report);
  };

  return (
    <div 
      className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer" 
      onClick={handleOpen}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${MODULE_COLORS[report.module]}`}>
            <span className="mr-1">{MODULE_ICONS[report.module]}</span>
            {report.module.toUpperCase()}
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-secondary-900 mb-2">{report.name}</h3>
        <p className="text-sm text-secondary-600 mb-4 line-clamp-2">{report.description}</p>
        
        <div className="flex justify-end items-center text-xs text-secondary-500">
          <div className={`inline-flex items-center px-2 py-1 rounded-full ${report.type === 'analytical' ? 'bg-indigo-50 text-indigo-700' : report.type === 'operational' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {report.type}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCard; 