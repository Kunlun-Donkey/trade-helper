import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useAuthStore } from '@/stores/authStore';
import MainLayout from '@/components/MainLayout';

// Lazy-loaded page components
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const CustomerListPage = lazy(() => import('@/pages/crm/CustomerListPage'));
const CustomerDetailPage = lazy(() => import('@/pages/crm/CustomerDetailPage'));
const ProductListPage = lazy(() => import('@/pages/product/ProductListPage'));
const DocumentListPage = lazy(() => import('@/pages/document/DocumentListPage'));
const CalculatorPage = lazy(() => import('@/pages/calculator/CalculatorPage'));
const OrderListPage = lazy(() => import('@/pages/order/OrderListPage'));
const AmazonPage = lazy(() => import('@/pages/amazon/AmazonPage'));
const ToolboxPage = lazy(() => import('@/pages/toolbox/ToolboxPage'));

function PageLoading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" tip="加载中..." />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff' } }}>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="crm" element={<CustomerListPage />} />
            <Route path="crm/:id" element={<CustomerDetailPage />} />
            <Route path="product" element={<ProductListPage />} />
            <Route path="document" element={<DocumentListPage />} />
            <Route path="calculator" element={<CalculatorPage />} />
            <Route path="order" element={<OrderListPage />} />
            <Route path="amazon" element={<AmazonPage />} />
            <Route path="toolbox" element={<ToolboxPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ConfigProvider>
  );
}

export default App;
