import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import CompaniesPage from './pages/CompaniesPage';
import VouchersPage from './pages/VouchersPage';
import ApprovedVouchersPage from './pages/ApprovedVouchersPage';
import CancelledVouchersPage from './pages/CancelledVouchersPage';
import DraftVouchersPage from './pages/DraftVouchersPage';
import DirectoryPage from './pages/DirectoryPage';
import ReportsPage from './pages/ReportsPage';
import AgentsPage from './pages/AgentsPage';
import CustomersPage from './pages/CustomersPage';
import CreateVoucherPage from './pages/CreateVoucherPage';
import SettingsPage from './pages/SettingsPage';
import VoucherPreviewPage from './pages/VoucherPreviewPage';
import PublicVoucherPage from './pages/PublicVoucherPage';

function SuperAdminRoute() { const { user } = useAuth(); return user?.role === 'super_admin' ? <Outlet /> : <Navigate to="/admin" replace />; }
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="grid min-h-screen place-items-center bg-slate-950 text-white">Loading secure workspace...</main>;
  return user ? <AdminLayout /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/voucher/:companySlug/:token" element={<PublicVoucherPage />} /><Route element={<ProtectedRoute />}><Route path="/admin" element={<DashboardPage />} /><Route path="/admin/companies" element={<CompaniesPage />} /><Route path="/admin/vouchers" element={<VouchersPage />} /><Route path="/admin/approved" element={<ApprovedVouchersPage />} /><Route path="/admin/cancelled" element={<CancelledVouchersPage />} /><Route path="/admin/drafts" element={<DraftVouchersPage />} /><Route path="/admin/agents" element={<AgentsPage />} /><Route path="/admin/customers" element={<CustomersPage />} /><Route path="/admin/reports" element={<ReportsPage />} /><Route path="/admin/vouchers/new" element={<CreateVoucherPage />} /><Route path="/admin/vouchers/:id/preview" element={<VoucherPreviewPage />} /><Route element={<SuperAdminRoute />}><Route path="/admin/settings" element={<SettingsPage />} /></Route></Route><Route path="*" element={<Navigate to="/admin" replace />} /></Routes>;
}
