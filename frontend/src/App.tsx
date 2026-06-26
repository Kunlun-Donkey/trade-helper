import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from '@/stores/authStore';
import MainLayout from '@/components/MainLayout';
import VisitorLayout from '@/components/visitor/VisitorLayout';
import LoginModal from '@/components/LoginModal';

// Visitor public pages
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const CalculatorPage = lazy(() => import('@/pages/calculator/CalculatorPage'));
const ToolboxPage = lazy(() => import('@/pages/toolbox/ToolboxPage'));
const ContactPage = lazy(() => import('@/pages/contact/ContactPage'));

// Logged-in private pages
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
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();
  if (isLoggedIn) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff' } }}>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Visitor public routes - marketing layout with top nav */}
          <Route element={<PublicOnly><VisitorLayout /></PublicOnly>}>
            <Route index element={<LandingPage />} />
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="toolbox" element={<ToolboxPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Logged-in private routes - sidebar admin layout */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="crm" element={<CustomerListPage />} />
            <Route path="crm/:id" element={<CustomerDetailPage />} />
            <Route path="product" element={<ProductListPage />} />
            <Route path="document" element={<DocumentListPage />} />
            <Route path="order" element={<OrderListPage />} />
            <Route path="amazon" element={<AmazonPage />} />
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="toolbox" element={<ToolboxPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global login modal */}
        <LoginModal />
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
