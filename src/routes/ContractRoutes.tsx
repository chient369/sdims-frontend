import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Lazy loaded components
const ContractList = lazy(() => import('../features/contracts/ContractList'));
const ContractDetail = lazy(() => import('../features/contracts/ContractDetail'));
const ContractForm = lazy(() => import('../features/contracts/ContractForm'));
const PaymentStatus = lazy(() => import('../features/contracts/PaymentStatus'));
const RevenueKPI = lazy(() => import('../features/contracts/RevenueKPI'));

const ContractRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/contracts/list" replace />} />
      <Route 
        path="list" 
        element={<PrivateRoute component={ContractList} requiredPermissions={['view_contracts']} />} 
      />
      <Route 
        path=":id" 
        element={<PrivateRoute component={ContractDetail} requiredPermissions={['view_contracts']} />} 
      />
      <Route 
        path="new" 
        element={<PrivateRoute component={ContractForm} requiredPermissions={['manage_contracts']} />} 
      />
      <Route 
        path=":id/edit" 
        element={<PrivateRoute component={ContractForm} requiredPermissions={['manage_contracts']} />} 
      />
      <Route 
        path="payments" 
        element={<PrivateRoute component={PaymentStatus} requiredPermissions={['manage_payments']} />} 
      />
      <Route 
        path="kpi" 
        element={<PrivateRoute component={RevenueKPI} requiredPermissions={['view_revenue_kpi']} />} 
      />
      <Route path="*" element={<Navigate to="/contracts/list" replace />} />
    </Routes>
  );
};

export default ContractRoutes; 