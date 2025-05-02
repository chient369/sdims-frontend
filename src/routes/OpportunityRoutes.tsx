import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Lazy loaded components
const OpportunityList = lazy(() => import('../features/opportunities/OpportunityList'));
const OpportunityDetail = lazy(() => import('../features/opportunities/OpportunityDetail'));
const NotesActivities = lazy(() => import('../features/opportunities/NotesActivities'));
const HubspotSync = lazy(() => import('../features/opportunities/HubspotSync'));

const OpportunityRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/opportunities/list" replace />} />
      <Route 
        path="list" 
        element={<PrivateRoute component={OpportunityList} requiredPermissions={['view_opportunities']} />} 
      />
      <Route 
        path=":id" 
        element={<PrivateRoute component={OpportunityDetail} requiredPermissions={['view_opportunities']} />} 
      />
      <Route 
        path=":id/activities" 
        element={<PrivateRoute component={NotesActivities} requiredPermissions={['view_opportunities']} />} 
      />
      <Route 
        path="sync" 
        element={<PrivateRoute component={HubspotSync} requiredPermissions={['manage_hubspot_sync']} />} 
      />
      <Route path="*" element={<Navigate to="/opportunities/list" replace />} />
    </Routes>
  );
};

export default OpportunityRoutes; 