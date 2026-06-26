import { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Switch, Button, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  AccountBookOutlined,
  BarChartOutlined,
  ToolOutlined,
  CustomerServiceOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ThunderboltOutlined,
  LoginOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import useAuthStore from '@/stores/authStore';
import { setAnimationsEnabled, isAnimationsEnabled } from '@/utils/gsap';

const { Header, Sider, Content } = Layout;

// Public menu items (accessible without login)
const publicMenuItems = [
  { key: '/calculator', icon: <CalculatorOutlined />, label: '利润计算器' },
  { key: '/toolbox', icon: <ToolOutlined />, label: '工具箱' },
  { key: '/contact', icon: <CustomerServiceOutlined />, label: '联系代账' },
];

// Private menu items (require login)
const privateMenuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '数据驾驶舱' },
  { key: '/crm', icon: <TeamOutlined />, label: '客户管理' },
  { key: '/product', icon: <ShoppingOutlined />, label: '产品库' },
  { key: '/document', icon: <FileTextOutlined />, label: '单证中心' },
  { key: '/order', icon: <AccountBookOutlined />, label: '订单台账' },
  { key: '/amazon', icon: <BarChartOutlined />, label: '亚马逊报表' },
];

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [animEnabled, setAnimEnabled] = useState(isAnimationsEnabled());
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout, showLoginModal } = useAuthStore();
  const { token: themeToken } = theme.useToken();

  // Build menu items based on login status
  const menuItems: MenuProps['items'] = isLoggedIn
    ? [...privateMenuItems, ...publicMenuItems]
    : publicMenuItems;

  // Page transition animation
  useEffect(() => {
    if (!contentRef.current || !isAnimationsEnabled()) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [location.pathname]);

  // Sidebar menu animation
  useEffect(() => {
    if (!isAnimationsEnabled()) return;
    const timer = setTimeout(() => {
      const items = document.querySelectorAll('.ant-menu-item');
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, x: -12 },
          { opacity: 1, x: 0, duration: 0.25, stagger: 0.04, ease: 'power2.out' }
        );
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  const handleAnimToggle = (checked: boolean) => {
    setAnimationsEnabled(checked);
    setAnimEnabled(checked);
  };

  const selectedKey = '/' + (location.pathname.split('/')[1] || 'calculator');

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    // Check if the route is private and user is not logged in
    const privateRoutes = ['/dashboard', '/crm', '/product', '/document', '/order', '/amazon'];
    if (!isLoggedIn && privateRoutes.some((r) => key.startsWith(r))) {
      showLoginModal('login');
      return;
    }
    navigate(key);
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') logout();
    else if (key === 'profile') navigate('/profile');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        theme="dark"
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h1
            style={{
              color: '#fff',
              fontSize: collapsed ? 16 : 20,
              fontWeight: 600,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {collapsed ? '外贸' : '外贸轻助手'}
          </h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: themeToken.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 9,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, cursor: 'pointer', color: '#333' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>
              <ThunderboltOutlined style={{ color: animEnabled ? '#faad14' : '#ccc' }} />
              <Switch size="small" checked={animEnabled} onChange={handleAnimToggle} />
              <span>动效</span>
            </div>
          </div>

          {/* Right side: login buttons or user avatar */}
          {isLoggedIn ? (
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                <span style={{ color: '#333', fontSize: 14 }}>
                  {user?.nickname || user?.username || '用户'}
                </span>
              </Space>
            </Dropdown>
          ) : (
            <Space size={12}>
              <Button type="text" icon={<LoginOutlined />} onClick={() => showLoginModal('login')}>
                登录
              </Button>
              <Button type="primary" onClick={() => showLoginModal('register')}>
                注册
              </Button>
            </Space>
          )}
        </Header>
        <Content
          ref={contentRef}
          style={{ margin: 24, minHeight: 280 }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
