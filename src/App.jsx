import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Logout from './components/Auth/Logout';
import ChangePassword from './components/Auth/ChangePassword';
import UserProfile from './components/UserManagement/UserProfile';
import ManageUserRole from './components/UserManagement/ManageUserRole';
import CreateDealerProfile from './components/DealerManagement/CreateDealerProfile';
import UpdateDealerProfile from './components/DealerManagement/UpdateDealerProfile';
import DeleteDealerProfile from './components/DealerManagement/DeleteDealerProfile';
import DealerOrders from './components/DealerManagement/DealerOrders';
import TrackInventory from './components/StockManagement/TrackInventory';
import UpdateStock from './components/StockManagement/UpdateStock';
import SetReorderLevels from './components/StockManagement/SetReorderLevels';
import SupplierDetail from './components/SupplierManagement/SupplierDetail';
import SupplierQuotations from './components/SupplierManagement/SupplierQuotations';
import CreateManufacturingOrder from './components/Manufacturing/CreateManufacturingOrder';
import ManufacturingCompletion from './components/Manufacturing/ManufacturingCompletion';
import GenerateBill from './components/BillingPayment/GenerateBill';
import PaymentTracking from './components/BillingPayment/PaymentTracking';
import SearchFilter from './components/SearchFilter';
import Notifications from './components/Notifications/Notifications';
import SystemAlerts from './components/Notifications/SystemAlerts';
import SalesReport from './components/Reporting/SalesReport';
import StockReport from './components/Reporting/StockReport';
import SupplierReport from './components/Reporting/SupplierReport';
import DataBackup from './components/SystemMaintenance/DataBackup';
import DataRecovery from './components/SystemMaintenance/DataRecovery';
import Dashboard from './components/Dashboard';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/check-session');
      const data = await res.json();
      setAuthenticated(data.authenticated);
    } catch (err) {
      setAuthenticated(false);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        <Route path="/system-authorization/logout" element={<Logout />} />
        <Route path="/system-authorization/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        
        <Route path="/user-management/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/user-management/manage-user-role" element={<ProtectedRoute><ManageUserRole /></ProtectedRoute>} />
        
        <Route path="/dealer-management/create-dealer-profile" element={<ProtectedRoute><CreateDealerProfile /></ProtectedRoute>} />
        <Route path="/dealer-management/update-dealer-profile/:id" element={<ProtectedRoute><UpdateDealerProfile /></ProtectedRoute>} />
        <Route path="/dealer-management/delete-dealer-profile/:id" element={<ProtectedRoute><DeleteDealerProfile /></ProtectedRoute>} />
        <Route path="/dealer-management/dealers-orders" element={<ProtectedRoute><DealerOrders /></ProtectedRoute>} />
        
        <Route path="/stock-management/track-inventory" element={<ProtectedRoute><TrackInventory /></ProtectedRoute>} />
        <Route path="/stock-management/update-stock" element={<ProtectedRoute><UpdateStock /></ProtectedRoute>} />
        <Route path="/stock-management/set-reorder-levels" element={<ProtectedRoute><SetReorderLevels /></ProtectedRoute>} />
        
        <Route path="/supplier-management/supplier-detail" element={<ProtectedRoute><SupplierDetail /></ProtectedRoute>} />
        <Route path="/supplier-management/supplier-quotations" element={<ProtectedRoute><SupplierQuotations /></ProtectedRoute>} />
        
        <Route path="/manufacturing/create-manufacturing-order" element={<ProtectedRoute><CreateManufacturingOrder /></ProtectedRoute>} />
        <Route path="/manufacturing/manufacturing-completion" element={<ProtectedRoute><ManufacturingCompletion /></ProtectedRoute>} />
        
        <Route path="/billing-payment/generate-bill" element={<ProtectedRoute><GenerateBill /></ProtectedRoute>} />
        <Route path="/billing-payment/payment-tracking" element={<ProtectedRoute><PaymentTracking /></ProtectedRoute>} />
        
        <Route path="/search-filter" element={<ProtectedRoute><SearchFilter /></ProtectedRoute>} />
        
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/notifications/system-alerts" element={<ProtectedRoute><SystemAlerts /></ProtectedRoute>} />
        
        <Route path="/reporting/sales-report" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
        <Route path="/reporting/stock-report" element={<ProtectedRoute><StockReport /></ProtectedRoute>} />
        <Route path="/reporting/supplier-report" element={<ProtectedRoute><SupplierReport /></ProtectedRoute>} />
        
        <Route path="/system-maintenance/data-backup" element={<ProtectedRoute><DataBackup /></ProtectedRoute>} />
        <Route path="/system-maintenance/data-recovery" element={<ProtectedRoute><DataRecovery /></ProtectedRoute>} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;