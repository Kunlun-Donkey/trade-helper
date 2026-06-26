import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';

export default function VisitorLayout() {
  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fc' }}>
      <TopNav />
      <div style={{ paddingTop: 64 }}>
        <Outlet />
      </div>
      {/* Footer */}
      <footer
        style={{
          padding: '40px 24px 24px',
          textAlign: 'center',
          background: '#001529',
          color: 'rgba(255,255,255,0.65)',
          fontSize: 13,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 12 }}>
            外贸轻助手
          </div>
          <div style={{ marginBottom: 16 }}>
            专为外贸B2B业务员、SOHO、中小亚马逊卖家打造的轻量化SaaS工具
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16 }}>
            &copy; {new Date().getFullYear()} 外贸轻助手 &middot; 永久免费 &middot; 无需API授权 &middot; 零风控
          </div>
        </div>
      </footer>
    </div>
  );
}
