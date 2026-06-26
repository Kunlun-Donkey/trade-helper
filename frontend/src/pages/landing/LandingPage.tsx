import { useEffect, useRef } from 'react';
import { Button, Row, Col, Card, Space, Tag } from 'antd';
import {
  CalculatorOutlined, ToolOutlined, CustomerServiceOutlined,
  CheckCircleOutlined, ThunderboltOutlined, SafetyCertificateOutlined,
  RocketOutlined, TeamOutlined, FileTextOutlined,
  BarChartOutlined, ShoppingOutlined, AccountBookOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import useAuthStore from '@/stores/authStore';

const features = [
  { icon: <TeamOutlined />, title: '轻量CRM', desc: '客户档案、意向标签、跟进记录、到期待办提醒' },
  { icon: <ShoppingOutlined />, title: '产品库', desc: '产品信息管理、图片上传、SKU检索' },
  { icon: <FileTextOutlined />, title: '单证中心', desc: 'PI/CI/PL/合同自动生成，一键PDF导出' },
  { icon: <AccountBookOutlined />, title: '订单台账', desc: '订单回款跟踪、逾期提醒、财务统计' },
  { icon: <BarChartOutlined />, title: '亚马逊报表', desc: 'CSV/Excel上传解析，销售趋势、库存预警' },
  { icon: <CalculatorOutlined />, title: '双利润计算器', desc: 'B2B外贸 + FBA利润，离线免费使用' },
];

const painPoints = [
  { before: '用Excel管理客户，数据散落各处', after: 'CRM统一管理，客户一目了然' },
  { before: '手动算利润，容易出错', after: '一键计算，B2B/FBA双模式' },
  { before: '做PI报价单要1小时', after: '3分钟自动生成，PDF一键导出' },
  { before: '不知道哪些客户该跟进', after: '智能待办提醒，不漏任何商机' },
];

const comparisons = [
  { feature: '外贸专用', us: true, excel: false, ai: false },
  { feature: '客户管理', us: true, excel: '手动', ai: false },
  { feature: '单证生成', us: true, excel: '手动排版', ai: '仅文本' },
  { feature: '利润计算', us: true, excel: '公式易错', ai: '需描述' },
  { feature: '数据安全', us: '本地+云端', excel: '本地文件', ai: '上传云端' },
  { feature: '离线使用', us: '计算器/工具箱', excel: true, ai: false },
  { feature: '零学习成本', us: true, excel: '需学公式', ai: '需学提示词' },
  { feature: '永久免费', us: true, excel: true, ai: '按量付费' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { showLoginModal } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      const children = heroRef.current.children;
      gsap.fromTo(children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' });
    }

    // Scroll-triggered animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(entry.target, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionsRef.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const addSectionRef = (el: HTMLDivElement | null, index: number) => {
    if (el) sectionsRef.current[index] = el;
  };

  return (
    <div>
      {/* Hero Section */}
      <div
        ref={heroRef}
        style={{
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 24px 60px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
        }}
      >
        <Tag color="rgba(255,255,255,0.2)" style={{ color: '#fff', padding: '4px 16px', fontSize: 14, marginBottom: 24, border: '1px solid rgba(255,255,255,0.3)' }}>
          永久免费 &middot; 零风控 &middot; 无需API授权
        </Tag>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.3 }}>
          外贸人的第一款轻量化工具
        </h1>
        <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', opacity: 0.9, maxWidth: 640, margin: '0 0 40px', lineHeight: 1.6 }}>
          CRM客户管理、单证自动生成、利润计算、亚马逊报表解析<br />
          告别Excel混乱，告别复杂ERP，一个工具搞定外贸全流程
        </p>
        <Space size={16}>
          <Button type="primary" size="large" style={{ height: 48, padding: '0 36px', fontSize: 16, borderRadius: 8 }} onClick={() => showLoginModal('register')}>
            免费注册，立即使用
          </Button>
          <Button size="large" ghost style={{ height: 48, padding: '0 36px', fontSize: 16, borderRadius: 8, borderColor: '#fff', color: '#fff' }} onClick={() => navigate('/calculator')}>
            先试试计算器
          </Button>
        </Space>
        <div style={{ marginTop: 32, opacity: 0.7, fontSize: 13 }}>
          已有 <strong>2000+</strong> 外贸人在使用
        </div>
      </div>

      {/* Pain Points Section */}
      <div ref={(el) => addSectionRef(el, 0)} style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          还在用这些低效方式？
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 48, fontSize: 16 }}>
          外贸轻助手帮你一步到位
        </p>
        <Row gutter={[24, 24]}>
          {painPoints.map((p, i) => (
            <Col xs={24} sm={12} key={i}>
              <Card style={{ borderRadius: 12, height: '100%', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#ff4d4f', fontSize: 14, marginBottom: 8, textDecoration: 'line-through', opacity: 0.7 }}>
                      {p.before}
                    </div>
                    <div style={{ color: '#52c41a', fontSize: 16, fontWeight: 500 }}>
                      <CheckCircleOutlined style={{ marginRight: 8 }} />
                      {p.after}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Features Grid */}
      <div ref={(el) => addSectionRef(el, 1)} style={{ background: '#fff', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
            全部功能，永久免费
          </h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: 48, fontSize: 16 }}>
            零API依赖、零风控、Excel导入、人工录入
          </p>
          <Row gutter={[24, 24]}>
            {features.map((f, i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Card
                  hoverable
                  style={{ borderRadius: 12, height: '100%', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
                >
                  <div style={{ fontSize: 36, color: '#1677ff', marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: '#666', margin: 0, fontSize: 14 }}>{f.desc}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Comparison Table */}
      <div ref={(el) => addSectionRef(el, 2)} style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          为什么选择外贸轻助手？
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 48, fontSize: 16 }}>
          对比Excel和通用AI，外贸轻助手更懂你
        </p>
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f5ff' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontWeight: 600, fontSize: 14 }}>功能对比</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 600, color: '#1677ff', fontSize: 14 }}>外贸轻助手</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 600, fontSize: 14 }}>Excel</th>
                <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 600, fontSize: 14 }}>通用AI</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 20px', fontSize: 14 }}>{row.feature}</td>
                  <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                    {row.us === true ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} /> :
                      <span style={{ color: '#52c41a', fontSize: 13, fontWeight: 500 }}>{row.us}</span>}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'center', color: '#999', fontSize: 13 }}>
                    {row.excel === true ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} /> :
                      row.excel === false ? <span style={{ color: '#ff4d4f' }}>&#x2717;</span> : row.excel}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'center', color: '#999', fontSize: 13 }}>
                    {row.ai === true ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} /> :
                      row.ai === false ? <span style={{ color: '#ff4d4f' }}>&#x2717;</span> : row.ai}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Section */}
      <div
        ref={(el) => addSectionRef(el, 3)}
        style={{
          padding: '80px 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>开始免费使用</h2>
        <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 32 }}>
          注册即解锁全部数据存储、文件导出、客户管理功能
        </p>
        <Space size={16}>
          <Button type="primary" size="large" style={{ height: 48, padding: '0 36px', fontSize: 16, borderRadius: 8 }} onClick={() => showLoginModal('register')}>
            免费注册
          </Button>
          <Button size="large" ghost style={{ height: 48, padding: '0 36px', fontSize: 16, borderRadius: 8, borderColor: '#fff', color: '#fff' }} onClick={() => navigate('/calculator')}>
            先体验工具
          </Button>
        </Space>
      </div>
    </div>
  );
}
