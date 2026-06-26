import { useState, useEffect, useRef } from 'react';
import { Button, Space, Drawer } from 'antd';
import { LoginOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import useAuthStore from '@/stores/authStore';

const navLinks = [
  { key: '/', label: '首页' },
  { key: '/calculator', label: '利润计算器' },
  { key: '/toolbox', label: '外贸工具箱' },
  { key: '/contact', label: '联系代账' },
];

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoginModal } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    }
  }, []);

  const activeKey = navLinks.find((l) => l.key === location.pathname)?.key || '/';

  return (
    <>
      <nav
        ref={navRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ fontSize: 20, fontWeight: 700, color: '#1677ff', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          外贸轻助手
        </div>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
          {navLinks.map((link) => (
            <div
              key={link.key}
              onClick={() => navigate(link.key)}
              style={{
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: activeKey === link.key ? 600 : 400,
                color: activeKey === link.key ? '#1677ff' : '#333',
                position: 'relative',
                padding: '4px 0',
              }}
            >
              {link.label}
              {activeKey === link.key && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -2,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: '#1677ff',
                    borderRadius: 1,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Desktop CTA buttons */}
        <Space size={12} className="desktop-nav">
          <Button type="text" icon={<LoginOutlined />} onClick={() => showLoginModal('login')}>
            登录
          </Button>
          <Button type="primary" onClick={() => showLoginModal('register')}>
            免费注册
          </Button>
        </Space>

        {/* Mobile hamburger */}
        <div className="mobile-nav" style={{ display: 'none' }}>
          <Button type="text" icon={mobileOpen ? <CloseOutlined /> : <MenuOutlined />} onClick={() => setMobileOpen(!mobileOpen)} />
        </div>
      </nav>

      {/* Mobile drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        placement="right"
        width={260}
        styles={{ body: { padding: '24px 16px' } }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {navLinks.map((link) => (
            <div
              key={link.key}
              onClick={() => { navigate(link.key); setMobileOpen(false); }}
              style={{
                fontSize: 16,
                fontWeight: activeKey === link.key ? 600 : 400,
                color: activeKey === link.key ? '#1677ff' : '#333',
                cursor: 'pointer',
              }}
            >
              {link.label}
            </div>
          ))}
          <Button type="primary" block onClick={() => { showLoginModal('register'); setMobileOpen(false); }}>
            免费注册
          </Button>
          <Button block onClick={() => { showLoginModal('login'); setMobileOpen(false); }}>
            登录
          </Button>
        </div>
      </Drawer>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: block !important; }
        }
      `}</style>
    </>
  );
}
