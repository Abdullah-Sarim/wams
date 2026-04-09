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
import SupplierQuotationsAdmin from './components/SupplierManagement/SupplierQuotations';
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
import NotAuthorized from './components/NotAuthorized';
import DealerLayout from './components/DealerPortal/DealerLayout';
import DealerDashboard from './components/DealerPortal/DealerDashboard';
import PlaceOrder from './components/DealerPortal/PlaceOrder';
import MyOrders from './components/DealerPortal/MyOrders';
import DealerNotifications from './components/DealerPortal/DealerNotifications';
import DealerProfile from './components/DealerPortal/DealerProfile';
import SupplierLayout from './components/SupplierPortal/SupplierLayout';
import SupplierDashboard from './components/SupplierPortal/SupplierDashboard';
import SupplierQuotations from './components/SupplierPortal/SupplierQuotations';
import SupplierNotifications from './components/SupplierPortal/SupplierNotifications';
import SupplierProfile from './components/SupplierPortal/SupplierProfile';
import ProductionManagerLayout from './components/ProductionManager/ProductionManagerLayout';
import ProductionManagerDashboard from './components/ProductionManager/ProductionManagerDashboard';
import ProductionManagerOrders from './components/ProductionManager/ProductionManagerOrders';
import CreateProductionOrder from './components/ProductionManager/CreateProductionOrder';
import RawMaterials from './components/ProductionManager/RawMaterials';
import FinishedProducts from './components/ProductionManager/FinishedProducts';

const ADMIN_ROLES = ['Administrator', 'Manager', 'Management Authority'];

function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => { checkAuth(); }, []);
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/check-session');
      const data = await res.json();
      setAuthenticated(data.authenticated);
      setUserRole(data.userRole || localStorage.getItem('userRole') || '');
    } catch (err) { setAuthenticated(false); }
    setLoading(false);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && allowedRoles.length > 0) {
    const storedRole = localStorage.getItem('userRole') || userRole;
    if (!allowedRoles.includes(storedRole)) return <Navigate to="/not-authorized" replace />;
  }
  return <Layout>{children}</Layout>;
}

function DealerProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isDealer, setIsDealer] = useState(false);
  useEffect(() => {
    fetch('/api/check-session').then(r => r.json()).then(d => { if (d.authenticated && d.userType === 'dealer') setIsDealer(true); setLoading(false); });
  }, []);
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!isDealer) return <Navigate to="/login" replace />;
  return <DealerLayout>{children}</DealerLayout>;
}

function SupplierProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isSupplier, setIsSupplier] = useState(false);
  useEffect(() => {
    fetch('/api/check-session').then(r => r.json()).then(d => { if (d.authenticated && d.userType === 'supplier') setIsSupplier(true); setLoading(false); });
  }, []);
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!isSupplier) return <Navigate to="/login" replace />;
  return <SupplierLayout>{children}</SupplierLayout>;
}

function ProductionManagerProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isPM, setIsPM] = useState(false);
  useEffect(() => {
    fetch('/api/check-session').then(r => r.json()).then(d => { if (d.authenticated && d.userRole === 'Production Manager') setIsPM(true); setLoading(false); });
  }, []);
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!isPM) return <Navigate to="/login" replace />;
  return <ProductionManagerLayout>{children}</ProductionManagerLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/not-authorized" element={<NotAuthorized />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/system-authorization/logout" element={<Logout />} />
        <Route path="/system-authorization/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        
        <Route path="/user-management/user-profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/user-management/manage-user-role" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><ManageUserRole /></ProtectedRoute>} />
        
        <Route path="/dealer-management/create-dealer-profile" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><CreateDealerProfile /></ProtectedRoute>} />
        <Route path="/dealer-management/update-dealer-profile/:id" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><UpdateDealerProfile /></ProtectedRoute>} />
        <Route path="/dealer-management/delete-dealer-profile/:id" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><DeleteDealerProfile /></ProtectedRoute>} />
        <Route path="/dealer-management/dealers-orders" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><DealerOrders /></ProtectedRoute>} />
        
        <Route path="/stock-management/track-inventory" element={<ProtectedRoute><TrackInventory /></ProtectedRoute>} />
        <Route path="/stock-management/update-stock" element={<ProtectedRoute><UpdateStock /></ProtectedRoute>} />
        <Route path="/stock-management/set-reorder-levels" element={<ProtectedRoute><SetReorderLevels /></ProtectedRoute>} />
        
        <Route path="/supplier-management/supplier-detail" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><SupplierDetail /></ProtectedRoute>} />
        <Route path="/supplier-management/supplier-quotations" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><SupplierQuotationsAdmin /></ProtectedRoute>} />
        
        <Route path="/manufacturing/create-manufacturing-order" element={<ProtectedRoute allowedRoles={[...ADMIN_ROLES, 'Production Manager']}><CreateManufacturingOrder /></ProtectedRoute>} />
        <Route path="/manufacturing/manufacturing-completion" element={<ProtectedRoute><ManufacturingCompletion /></ProtectedRoute>} />
        
        <Route path="/billing-payment/generate-bill" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><GenerateBill /></ProtectedRoute>} />
        <Route path="/billing-payment/payment-tracking" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><PaymentTracking /></ProtectedRoute>} />
        
        <Route path="/search-filter" element={<ProtectedRoute><SearchFilter /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/notifications/system-alerts" element={<ProtectedRoute><SystemAlerts /></ProtectedRoute>} />
        
        <Route path="/reporting/sales-report" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><SalesReport /></ProtectedRoute>} />
        <Route path="/reporting/stock-report" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><StockReport /></ProtectedRoute>} />
        <Route path="/reporting/supplier-report" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><SupplierReport /></ProtectedRoute>} />
        
        <Route path="/system-maintenance/data-backup" element={<ProtectedRoute allowedRoles={['Administrator']}><DataBackup /></ProtectedRoute>} />
        <Route path="/system-maintenance/data-recovery" element={<ProtectedRoute allowedRoles={['Administrator']}><DataRecovery /></ProtectedRoute>} />
        
        <Route path="/dealer/dashboard" element={<DealerProtectedRoute><DealerDashboard /></DealerProtectedRoute>} />
        <Route path="/dealer/place-order" element={<DealerProtectedRoute><PlaceOrder /></DealerProtectedRoute>} />
        <Route path="/dealer/my-orders" element={<DealerProtectedRoute><MyOrders /></DealerProtectedRoute>} />
        <Route path="/dealer/notifications" element={<DealerProtectedRoute><DealerNotifications /></DealerProtectedRoute>} />
        <Route path="/dealer/profile" element={<DealerProtectedRoute><DealerProfile /></DealerProtectedRoute>} />
        
        <Route path="/supplier/dashboard" element={<SupplierProtectedRoute><SupplierDashboard /></SupplierProtectedRoute>} />
        <Route path="/supplier/quotations" element={<SupplierProtectedRoute><SupplierQuotations /></SupplierProtectedRoute>} />
        <Route path="/supplier/notifications" element={<SupplierProtectedRoute><SupplierNotifications /></SupplierProtectedRoute>} />
        <Route path="/supplier/profile" element={<SupplierProtectedRoute><SupplierProfile /></SupplierProtectedRoute>} />
        
        <Route path="/production-manager/dashboard" element={<ProductionManagerProtectedRoute><ProductionManagerDashboard /></ProductionManagerProtectedRoute>} />
        <Route path="/production-manager/orders" element={<ProductionManagerProtectedRoute><ProductionManagerOrders /></ProductionManagerProtectedRoute>} />
        <Route path="/production-manager/create-order" element={<ProductionManagerProtectedRoute><CreateProductionOrder /></ProductionManagerProtectedRoute>} />
        <Route path="/production-manager/raw-materials" element={<ProductionManagerProtectedRoute><RawMaterials /></ProductionManagerProtectedRoute>} />
        <Route path="/production-manager/finished-products" element={<ProductionManagerProtectedRoute><FinishedProducts /></ProductionManagerProtectedRoute>} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;