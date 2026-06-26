import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from '@/stores/authStore';
import MainLayout from '@/components/MainLayout';
import LoginModal from '@/components/LoginModal';

// Public pages (no login required)
const CalculatorPage = lazy(() => import('@/pages/calculator/CalculatorPage'));
const ToolboxPage = lazy(() => import('@/pages/toolbox/ToolboxPage'));
const ContactPage = lazy(() => import('@/pages/contact/ContactPage'));

// Private pages (login required)
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const CustomerListPage = lazy(() => import('@/pages/crm/CustomerListPage'));
const CustomerDetailPage = lazy(() => import('@/pages/crm/CustomerDetailPage'));
const ProductListPage = lazy(() => import('@/pages/product/ProductListPage'));
const DocumentListPage = lazy(() => import('@/pages/document/DocumentListPage'));
const OrderListPage = lazy(() => import('@/pages/order/OrderListPage'));
const AmazonPage = lazy(() => import('@/pages/amazon/AmazonPage'));

function PageLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" tip="加载中..." />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, showLoginModal } = useAuthStore();
  if (!isLoggedIn) {
    showLoginModal('login');
    return <Navigate to="/calculator" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff' } }}>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* All routes use MainLayout (sidebar visible for everyone) */}
          <Route path="/" element={<MainLayout />}>
            {/* Default redirect */}
            <Route index element={<Navigate to="/calculator" replace />} />

            {/* Public routes - no login required */}
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="toolbox" element={<ToolboxPage />} />
            <Route path="contact" element={<ContactPage />} />

            {/* Private routes - login required */}
            <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="crm" element={<ProtectedRoute><CustomerListPage /></ProtectedRoute>} />
            <Route path="crm/:id" element={<ProtectedRoute><CustomerDetailPage /></ProtectedRoute>} />
            <Route path="product" element={<ProtectedRoute><ProductListPage /></ProtectedRoute>} />
            <Route path="document" element={<ProtectedRoute><DocumentListPage /></ProtectedRoute>} />
            <Route path="order" element={<ProtectedRoute><OrderListPage /></ProtectedRoute>} />
            <Route path="amazon" element={<ProtectedRoute><AmazonPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/calculator" replace />} />
        </Routes>

        {/* Global login modal */}
        <LoginModal />
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
