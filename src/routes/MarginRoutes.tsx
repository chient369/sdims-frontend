import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Lazy loaded components
const MarginList = lazy(() => import('../features/margin/MarginList'));
const CostInput = lazy(() => import('../features/margin/CostInput'));
const CostImport = lazy(() => import('../features/margin/CostImport'));
const MarginCharts = lazy(() => import('../features/margin/MarginCharts'));

const MarginRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/margins/list" replace />} />
      <Route 
        path="list" 
        element={<PrivateRoute component={MarginList} requiredPermissions={['view_margins']} />} 
      />
      <Route 
        path="costs" 
        element={<PrivateRoute component={CostInput} requiredPermissions={['manage_costs']} />} 
      />
      <Route 
        path="import" 
        element={<PrivateRoute component={CostImport} requiredPermissions={['manage_costs']} />} 
      />
      <Route 
        path="charts" 
        element={<PrivateRoute component={MarginCharts} requiredPermissions={['view_margins']} />} 
      />
      <Route path="*" element={<Navigate to="/margins/list" replace />} />
    </Routes>
  );
};

export default MarginRoutes; 